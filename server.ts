import express from 'express'
import cors from 'cors'
import AttendanceRoute from './routes/attendance.route'
import EmployeeRoute from './routes/employee.route'
import dayjs from 'dayjs'
import prisma from './appDataSource'


const app = express()

app.use(express.json())
app.use(cors())
app.use("/api", AttendanceRoute, EmployeeRoute)


const addDateAllUser = async () => {

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

    RestartAgain()

}

const RestartAgain = () => {
    let now = dayjs()
    let tomorrow_minight = dayjs().add(1, 'day').startOf('day')
    let diff = tomorrow_minight.diff(now)

    setTimeout(() => {
        addDateAllUser()
    }, diff)
}

RestartAgain()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})