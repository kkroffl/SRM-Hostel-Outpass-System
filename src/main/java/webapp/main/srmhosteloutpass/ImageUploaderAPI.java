package webapp.main.srmhosteloutpass;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import webapp.main.srmhosteloutpass.utilities.DBConnector;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@WebServlet("/medicalOutpass")
@MultipartConfig(
        maxFileSize = 4 * 1024 * 1024
)
public class ImageUploaderAPI extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        doPost(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        Integer requestID = (Integer) req.getAttribute("requestID");
        Part imagePart = req.getPart("proof_img");
        var errorWriter = res.getWriter();
        if (!imagePart.getContentType().startsWith("image/")) {
            errorWriter.write("[ERROR] |INVALID_IMAGE_TYPE]");
            return;
        }
        if (imagePart.getSize() > 4 * 1024 * 1024) {
            errorWriter.write("[ERROR] | [FILE_TOO_LARGE]");
            return;
        }
        InputStream imageStream = imagePart.getInputStream();
        try (Connection c = DBConnector.getConnection()) {

            PreparedStatement updateImage = c.prepareStatement(
                    "UPDATE outpass_requests SET proof_img = ? WHERE requestId = ?"
            );
            updateImage.setBlob(1, imageStream, imagePart.getSize());
            updateImage.setInt(2, requestID);
            if (updateImage.executeUpdate() > 0) {
                errorWriter.write("[SUCCESS] | [IMAGE_UPLOADED]");
            }
        } catch (SQLException _) {
            errorWriter.write("[ERROR] | [SQL_ERROR] from ImageUploaderAPI");
        }
    }
}