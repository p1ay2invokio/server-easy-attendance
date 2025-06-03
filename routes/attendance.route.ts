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

app.post("/attend", async (req: Request, res: Response) => {
    const { id, my_lat, my_long } = req.body

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
        let store_employee = await prisma.store.findFirst({
            where: {
                id: userId.store_id
            }
        })


        // Create object and pass the lat, long via class LatLon
        const p1 = new LatLon(Number(store_employee?.lat), Number(store_employee?.lng));
        const p2 = new LatLon(my_lat, my_long)
        // const p2 = new LatLon(18.528525, 98.859388)

        // Use Method for find meters of these points
        const distance = p1.distanceTo(p2)

        if (store_employee) {
            if (distance <= store_employee?.radius) {
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

                    await prisma.attendance.create({
                        data: {
                            eid: Number(id),
                            work_timestamp: today,
                            in_timestamp: time_now,
                            out_timestamp: 0
                        }
                    })

                    res.status(200).send({ status: true, message: "เข้างานสำเร็จ!" })
                }
            } else {
                res.status(400).send({ status: false, message: `คุณไม่ได้อยู่ในพื้นที่! ห่าง ${(distance / 1000).toFixed(2)} กิโลเมตร` })
            }
        } else {
            res.status(401).send({ status: false, message: "ไม่พบ id นี้ในระบบ" })
        }
    }

    // const hours = dayjs().hour()

    // console.log(hours)

    // console.log(time_now)

    // console.log(id)
})

app.post("/out", async (req: Request, res: Response) => {

    const { id, my_lat, my_long } = req.body

    if (!id) {
        res.status(400).send({ status: false, message: "id is missing!" })
    }

    const employee = await prisma.employee.findFirst({
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



        // Get Lat Long Place Working
        let store_employee = await prisma.store.findFirst({
            where: {
                id: employee?.store_id
            }
        })


        // Create object and pass the lat, long via class LatLon
        const p1 = new LatLon(Number(store_employee?.lat), Number(store_employee?.lng));
        const p2 = new LatLon(my_lat, my_long)
        // const p2 = new LatLon(18.528525, 98.859388)

        const distance = p1.distanceTo(p2)

        if (store_employee) {
            if (distance <= store_employee?.radius) {
                if (attendance && attendance.in_timestamp) {

                    if (attendance.out_timestamp) {
                        res.status(400).send({ status: false, message: "คุณออกงานไปแล้ว กรุณาอย่ากดซ้ำ!" })
                    } else {
                        const out_timestamp = dayjs().unix()

                        await prisma.attendance.update({
                            data: {
                                out_timestamp: out_timestamp
                            }, where: {
                                id: attendance.id
                            }
                        })

                        res.status(200).send({ status: true, message: "ออกจากงานสำเร็จ!" })
                    }
                } else {
                    res.status(400).send({ status: false, message: "คุณยัังไม่ได้เข้างานไม่สามารถออกได้!" })
                }
            } else {
                res.status(400).send({ status: false, message: `ไม่สามารถออกงานได้ คุณไม่ได้อยู่ในพื้นที่! ห่าง ${(distance / 1000).toFixed(2)} กิโลเมตร` })
            }
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
            out_timestamp: {
                not: 0
            }
        }, orderBy: {
            id: "desc"
        }
    })

    res.status(200).send({ status: true, data: history_user })
})


export default app