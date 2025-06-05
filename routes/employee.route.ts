import { Router, Request, Response } from "express";
import prisma from "../appDataSource";
import dayjs from "dayjs";

const app = Router()

app.get("/today_data/:id", async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
        res.status(401).send({ status: false, message: "id is missing" })
    }

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
        res.status(200).send({ status: true, data: employee })
    } else {
        res.status(200).send([])
    }

})


app.post("/login", async(req: Request, res: Response)=>{
    let {phoneNumber} = req.body

    let userData = await prisma.employee.findFirst({where:{
        phoneNumber: phoneNumber
    }})

    if(userData){
        res.status(200).send({status: true, data: userData})
    }else{
        res.status(401).send({status: false, message: "เบอร์โทรไม่ถูกต้อง"})
    }
})

app.get("/detail/:id", async(req: Request, res: Response)=>{
    const {id} = req.params

    let userData = await prisma.employee.findFirst({
        where:{
            id: Number(id)
        },
        include:{
            store: true
        }
    })
    
    res.status(200).send(userData)
})


export default app