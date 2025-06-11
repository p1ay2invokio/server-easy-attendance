import { Router, Request, Response } from "express";
import prisma from "../appDataSource";
import dayjs from "dayjs";
import 'dayjs/locale/th'

const app = Router()

app.get("/today_data/:id", async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
        res.status(401).send({ status: 401, message: "id is missing" })
    }

    let userData = await prisma.employee.findFirst({
        where: {
            id: Number(id)
        }
    })

    if (userData) {
        let today = dayjs().locale('th').format("DD-MM-YYYY")

        let employee = await prisma.attendance.findFirst({
            select: {
                id: true,
                eid: true,
                in_timestamp: true,
                out_timestamp: true,
                work_timestamp: true,
                employee: true
            }, where: {
                eid: Number(id),
                work_timestamp: today
            }
        })

        if (employee) {
            res.status(200).send({ status: 200, data: employee })
        } else {
            res.status(200).send([])
        }

    } else {
        res.status(401).send({ status: 401, message: "ไม่มี User นี้อยู่ในระบบ" })
    }
})


app.post("/login", async (req: Request, res: Response) => {
    let { phoneNumber } = req.body

    let userData = await prisma.employee.findFirst({
        where: {
            phoneNumber: phoneNumber
        }
    })

    if (userData) {
        res.status(200).send({ status: true, data: userData })
    } else {
        res.status(401).send({ status: false, message: "เบอร์โทรไม่ถูกต้อง" })
    }
})

app.get("/detail/:id", async (req: Request, res: Response) => {
    const { id } = req.params

    let userData = await prisma.employee.findFirst({
        where: {
            id: Number(id)
        },
        include: {
            store: true
        }
    })

    let attendances = await prisma.attendance.findMany({
        where: {
            eid: Number(id),
        }
    })

    // console.log(attendances)

    var this_month = new Date().getMonth() + 1
    console.log(this_month)

    let summary_months = attendances.reduce((total: any, item: any) => {
        let month = Number(item.work_timestamp.split('-')[1])

        if (this_month == month) {
            total = total + Number(item.revenue)
        }

        return total
    }, 0)

    let summary_total = attendances.reduce((total: any, item: any) => {
        let month = Number(item.work_timestamp.split('-')[1])

        total = total + Number(item.revenue)

        return total
    }, 0)

    console.log(summary_months)

    let cleanData = {
        summary_months,
        summary_total,
        userData,
    }

    res.status(200).send(cleanData)
})

app.get("/employees", async (req: Request, res: Response) => {

    let employees = await prisma.employee.findMany()

    res.status(200).send(employees)
})

app.get("/employee/date/:id", async (req: Request, res: Response) => {

    let { id } = req.params


    let employee_date = await prisma.attendance.findMany({
        where: {
            eid: Number(id)
        },
        orderBy: {
            id: 'desc'
        }
    })

    res.status(200).send(employee_date)
})

app.patch("/employee/revenue", async (req: Request, res: Response) => {
    let { aid, revenue_new } = req.body

    console.log(aid, revenue_new)


    if (aid && revenue_new) {

        let attend:any = await prisma.attendance.findFirst({where:{
            id: aid
        }})

        let employee:any = await prisma.employee.findFirst({where:{
            id: attend?.eid
        }})


        
        await prisma.attendance.update({
            data: {
                revenue: revenue_new
            }, where: {
                id: aid
            }
        })

        let amount = revenue_new - attend?.revenue
        let total = employee?.cash + amount
        
        await prisma.employee.update({

            data:{
                cash: total
            },
            where:{
                id: attend?.eid
            }
        })

        res.status(200).send({ message: "Update Successfully!" })
    }
})

app.patch("/employee/paid/salary", async(req: Request, res: Response)=>{

    let {eid} = req.body

    await prisma.employee.update({
        data:{
            cash: 0
        },
        where:{
            id: eid
        }
    })

    res.status(200).send({status: res.statusCode, message: "จ่ายเงินเดือนสำเร็จ!"})
})


export default app