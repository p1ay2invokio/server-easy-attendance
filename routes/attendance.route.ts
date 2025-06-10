import { Router, Request, Response } from "express";
import prisma from "../appDataSource";
import dayjs from "dayjs";
import LatLon from 'geodesy/latlon-spherical'
import 'dayjs/locale/th'


const app = Router()

// Har
// const calculateDistance=(destination_lat: number, destination_long: number, me_lat: number, me_long: number)=>{
//     const EarthRadius = 6378


// }

// let nowUnix = dayjs().unix()
// let midnightUnix = dayjs().add(1, 'day').startOf('day').unix();
// let diffSec = midnightUnix - nowUnix
// let ms = diffSec * 1000

// console.log('Now (Unix):', nowUnix);
// console.log('Midnight (Unix):', midnightUnix);
// console.log('Milliseconds until midnight:', diffMilliseconds);

// setTimeout(()=>{

// }, ms)

const SalaryCal = (in_timestamp: number, out_timestamp: number, rate: number | any) => {
    let salary = Math.floor((dayjs.unix(out_timestamp).diff(dayjs.unix(in_timestamp), 'minutes') / 30)) * (rate / 12) / 2

    return salary
}

app.post("/attend", async (req: Request, res: Response) => {
    const { id, aid ,my_lat, my_long } = req.body

    if (!id) {
        res.status(401).send({ status: false, message: "id is missing!" })
    }


    // Get currently time and dmy Of today
    const time_now = dayjs().unix()
    const today = dayjs().locale('th').format('DD-MM-YYYY')

    // Define TaveethongPlace latitude, longitude
    // const MaeKhanPlace = {
    //     lat: 18.528631,
    //     long: 98.8595009
    // }




    let userId = await prisma.employee.findFirst({
        where: {
            id: Number(id)
        }
    })

    // Check user
    if (userId) {

        console.log(my_lat, my_long)

        // Get Lat Long Place Working
        let store_employee = await prisma.store.findMany()

        let keep_distance: any[] = []

        if (store_employee && store_employee.length > 0) {
            store_employee.map((item) => {
                // Create object and pass the lat, long via class LatLon
                const p1 = new LatLon(Number(item?.lat), Number(item?.lng));
                const p2 = new LatLon(my_lat, my_long)
                // const p2 = new LatLon(19.528525, 98.859388)

                // Use Method for find meters of these points
                const distance = p1.distanceTo(p2)

                keep_distance.push({
                    meters: distance,
                    radius: item.radius
                })
            })
        }
        // console.log(keep_distance)

        let near_area = keep_distance.filter((item) => item.meters <= item.radius)

        // console.log(near_area)


        if (near_area && near_area.length > 0) {
            // Get today_attendance by date
            const today_attendance = await prisma.attendance.findFirst({
                where: {
                    eid: Number(id),
                    work_timestamp: today
                }
            })
            if (today_attendance?.in_timestamp) {
                res.status(400).send({ status: false, message: "เข้างานซ้ำไม่ได้!" })
            } else {

                await prisma.attendance.update({
                    data: {
                        in_timestamp: time_now,
                    },where:{
                        id: aid
                    }
                })

                res.status(200).send({ status: true, message: "เข้างานสำเร็จ!" })
            }
        } else {
            res.status(400).send({ status: false, message: `คุณไม่ได้อยู่ในพื้นที่!` })
        }
    } else {
        res.status(400).send({ status: false, message: `ไม่พบ UserId!` })
    }
})


app.post("/out", async (req: Request, res: Response) => {

    const { id, my_lat, my_long, revenue } = req.body

    if (!id) {
        res.status(400).send({ status: false, message: "id is missing!" })
    }

    const employee:any = await prisma.employee.findFirst({
        where: {
            id: id
        }
    })

    if (!employee) {
        res.status(401).send({ status: false, message: "ไม่มีพนักงานนี้ในระบบ" })
    }

    const today = dayjs().locale('th').format('DD-MM-YYYY')

    const attendance = await prisma.attendance.findFirst({
        where: {
            eid: id,
            work_timestamp: today
        }
    })

    if (attendance) {

        let store_employee = await prisma.store.findMany()

        let keep_distance: any[] = []

        if (store_employee && store_employee.length > 0) {
            store_employee.map((item) => {
                // Create object and pass the lat, long via class LatLon
                const p1 = new LatLon(Number(item?.lat), Number(item?.lng));
                const p2 = new LatLon(my_lat, my_long)
                // const p2 = new LatLon(19.528525, 98.859388)

                // Use Method for find meters of these points
                const distance = p1.distanceTo(p2)

                keep_distance.push({
                    meters: distance,
                    radius: item.radius
                })
            })
        }

        let near_area = keep_distance.filter((item) => item.meters <= item.radius)


        if (near_area && near_area.length > 0) {
            if (attendance && attendance.in_timestamp) {

                if (attendance.out_timestamp) {
                    res.status(400).send({ status: false, message: "คุณออกงานไปแล้ว กรุณาอย่ากดซ้ำ!" })
                } else {
                    
                    
                    const out_timestamp = dayjs().unix()

                    let today_revenue = SalaryCal(attendance.in_timestamp, out_timestamp, employee?.rate)

                    await prisma.attendance.update({
                        data: {
                            out_timestamp: out_timestamp,
                            revenue: today_revenue
                        }, where: {
                            id: attendance.id
                        }
                    })

                    await prisma.employee.update({
                        data:{
                            cash: employee?.cash + today_revenue
                        },
                        where:{
                            id: id
                        }
                    })

                    res.status(200).send({ status: true, message: "ออกจากงานสำเร็จ!" })
                }
            } else {
                res.status(400).send({ status: false, message: "คุณยัังไม่ได้เข้างานไม่สามารถออกได้!" })
            }
        } else {
            res.status(400).send({ status: false, message: `ไม่สามารถออกงานได้ คุณไม่ได้อยู่ในพื้นที่!` })
        }

    } else {
        res.status(400).send({ status: false, message: "ยังไม่ได้เข้างาน กดออกไม่ได้!" })
    }
})

app.get("/history/:id", async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
        res.status(401).send({ status: false, message: "id is missing" })
    }

    let history_user = await prisma.attendance.findMany({
        where: {
            eid: Number(id),
        }, orderBy: {
            id: "desc"
        }, include: {
            employee: true
        }
    })

    res.status(200).send({ status: true, data: history_user })
})

app.get("/create_date", async(req:Request, res: Response)=>{
    let today = dayjs().locale('th').format("DD-MM-YYYY")

    let employees = await prisma.employee.findMany()

    employees.map(async (item) => {
        await prisma.attendance.create({
            data: {
                eid: item.id,
                work_timestamp: today,
                in_timestamp: 0,
                out_timestamp: 0,
                revenue: 0
            }
        })

        console.log(item.id, "Insert Data")
    })

    res.status(200) .send("Create Date Successfully")
})


export default app