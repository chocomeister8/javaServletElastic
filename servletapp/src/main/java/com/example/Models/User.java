package com.example.Models;

public class User {
    private String name;
    private String password;
    private String email;
    private Integer age;
    private String dateOfBirth; // format: yyyy-MM-dd
    private boolean isBanned;

    // ✅ Required no-arg constructor
    public User() {
        
    }

    public User(String name, String password, String email, Integer age, String dateOfBirth, boolean isBanned) {
        this.name = name;
        this.password = password;
        this.email = email;
        this.age = age;
        this.dateOfBirth = dateOfBirth;
        this.isBanned = isBanned;
    }

    // Getters
    public String getName() { return name; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public Integer getAge() { return age; }
    public String getDateOfBirth() { return dateOfBirth; }
    public boolean getisBanned() { return isBanned; }

    // ✅ Setters (required for JSON deserialization)
    public void setName(String name) { this.name = name; }
    public void setPassword(String password) { this.password = password; }
    public void setEmail(String email) { this.email = email; }
    public void setAge(Integer age) { this.age = age; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setisBanned(boolean isBanned) { this.isBanned = isBanned; }

}
