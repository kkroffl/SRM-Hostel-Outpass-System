package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.*;

@WebServlet("/studentsDatabase")
public class StudentsDatabaseServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        PrintWriter out = resp.getWriter();

        Connection conn = DBConnector.getConnection();
        if (conn == null) {
            out.print("[]");
            return;
        }

        try {
            // 1️⃣ Fetch all students
            String studentQuery =
                    "SELECT id, registeredNumber, name, email FROM students";

            PreparedStatement psStudents = conn.prepareStatement(studentQuery);
            ResultSet rsStudents = psStudents.executeQuery();

            List<Map<String, Object>> studentsList = new ArrayList<>();

            while (rsStudents.next()) {
                int studentId = rsStudents.getInt("id");

                Map<String, Object> student = new LinkedHashMap<>();
                student.put("id", studentId);
                student.put("registeredNumber", rsStudents.getString("registeredNumber"));
                student.put("name", rsStudents.getString("name"));
                student.put("email", rsStudents.getString("email"));

                // 2️⃣ Fetch outpasses for each student
                String outpassQuery =
                        "SELECT reason, from_date, to_date, from_day, from_time, to_day, " +
                                "actual_return_date, return_day, return_time, status, remarks " +
                                "FROM outpass_requests WHERE studentId = ? ORDER BY rId DESC";

                PreparedStatement psOutpass = conn.prepareStatement(outpassQuery);
                psOutpass.setInt(1, studentId);

                ResultSet rsOutpass = psOutpass.executeQuery();

                List<Map<String, Object>> outpasses = new ArrayList<>();

                while (rsOutpass.next()) {
                    Map<String, Object> o = new LinkedHashMap<>();

                    o.put("reason", rsOutpass.getString("reason"));
                    o.put("from_date", rsOutpass.getString("from_date"));
                    o.put("to_date", rsOutpass.getString("to_date"));
                    o.put("from_day", rsOutpass.getString("from_day"));
                    o.put("from_time", rsOutpass.getString("from_time"));
                    o.put("to_day", rsOutpass.getString("to_day"));
                    o.put("actual_return_date", rsOutpass.getString("actual_return_date"));
                    o.put("return_day", rsOutpass.getString("return_day"));
                    o.put("return_time", rsOutpass.getString("return_time"));
                    o.put("status", rsOutpass.getString("status"));
                    o.put("remarks", rsOutpass.getString("remarks"));

                    outpasses.add(o);
                }

                student.put("outpasses", outpasses);
                studentsList.add(student);
            }

            out.print(toJson(studentsList));

        } catch (Exception e) {
            e.printStackTrace();
            out.print("[]");
        }
    }

    // 🔹 Minimal JSON builder (no external libraries)
    private String toJson(Object obj) {
        if (obj instanceof List) {
            StringBuilder sb = new StringBuilder("[");
            List<?> list = (List<?>) obj;
            for (int i = 0; i < list.size(); i++) {
                sb.append(toJson(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }

        if (obj instanceof Map) {
            StringBuilder sb = new StringBuilder("{");
            Map<?, ?> map = (Map<?, ?>) obj;
            int i = 0;
            for (Map.Entry<?, ?> e : map.entrySet()) {
                sb.append("\"").append(e.getKey()).append("\":");
                sb.append(e.getValue() == null
                        ? "null"
                        : "\"" + e.getValue().toString().replace("\"", "\\\"") + "\"");
                if (++i < map.size()) sb.append(",");
            }
            sb.append("}");
            return sb.toString();
        }

        return "\"\"";
    }
}
