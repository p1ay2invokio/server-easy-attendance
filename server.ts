import express from 'express'
import cors from 'cors'
import AttendanceRoute from './routes/attendance.route'
import EmployeeRoute from './routes/employee.route'


const app = express()

app.use(express.json())
app.use(cors())
app.use("/api", AttendanceRoute, EmployeeRoute)


app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})