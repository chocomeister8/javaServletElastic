package com.example.controller;

import com.example.Utils.JwtUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/api/user-info")
public class UserInfoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Get JWT token from cookie named "token"
        String token = null;
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print("{\"message\": \"Missing token cookie\"}");
            out.flush();
            return;
        }

        try {
            String name = JwtUtil.extractSubject(token); // Extract user name from JWT token

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print("{\"name\": \"" + name + "\"}");
            out.flush();
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print("{\"message\": \"Invalid or expired token\"}");
            out.flush();
        }
    }
}
