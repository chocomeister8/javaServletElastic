package com.example.models;

public class User {
    private String name;
    private String password;
    private String email;
    private Integer age;
    private String dateOfBirth; // format: yyyy-MM-dd
    private String status;
    private String groups;

    // ✅ Required no-arg constructor
    public User() {
        
    }

    public User(String name, String password, String email, Integer age, String dateOfBirth, String status, String groups) {
        this.name = name;
        this.password = password;
        this.email = email;
        this.age = age;
        this.dateOfBirth = dateOfBirth;
        this.status = status;
        this.groups = groups;
    }

    // Getters
    public String getName() { return name; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public Integer getAge() { return age; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getStatus() { return status; }
    public String getGroups() { return groups; }

    // ✅ Setters (required for JSON deserialization)
    public void setName(String name) { this.name = name; }
    public void setPassword(String password) { this.password = password; }
    public void setEmail(String email) { this.email = email; }
    public void setAge(Integer age) { this.age = age; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setStatus(String status) { this.status = status; }
    public void setGroups(String groups) { this.groups = groups;}
}
