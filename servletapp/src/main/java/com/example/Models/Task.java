package com.example.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Task {
    private String taskName;
    private String taskDescription;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime taskStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime taskEndDate;

    private String taskOwner;
    private String taskColor;


    // No-arg constructor
    public Task() {
    }

    public Task(String taskName, String taskDescription, LocalDateTime taskStartDate, LocalDateTime taskEndDate, String taskOwner, String taskColor) {
        this.taskName = taskName;
        this.taskDescription = taskDescription;
        this.taskStartDate = taskStartDate;
        this.taskEndDate = taskEndDate;
        this.taskOwner = taskOwner;
        this.taskColor = taskColor;
    }

    // Getters
    public String getTaskName() { return taskName; }
    public String getTaskDescription() { return taskDescription; }
    public LocalDateTime getTaskStartDate() { return taskStartDate; }
    public LocalDateTime getTaskEndDate() { return taskEndDate; }
    public String getTaskOwner() { return taskOwner; }
    public String getTaskColor() { return taskColor; }

    // Setters
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public void setTaskDescription(String taskDescription) { this.taskDescription = taskDescription; }
    public void setTaskStartDate(LocalDateTime taskStartDate) { this.taskStartDate = taskStartDate; }
    public void setTaskEndDate(LocalDateTime taskEndDate) { this.taskEndDate = taskEndDate; }
    public void setTaskOwner(String taskOwner) { this.taskOwner = taskOwner; }
    public void setTaskColor(String taskColor) { this.taskColor = taskColor; }
}

