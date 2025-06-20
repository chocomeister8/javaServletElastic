package com.example.models;

public class Tasks {
    private int taskID;
    private String taskName;
    private String taskDescription;
    private String taskStartDate;
    private String taskEndDate; // format: yyyy-MM-dd
    private String taskOwner;

    // ✅ Required no-arg constructor
    public Tasks() {
        
    }

    public Tasks(int taskID, String taskName, String taskDescription, String taskStartDate, String taskEndDate, String taskOwner) {
        this.taskID = taskID;
        this.taskName = taskName;
        this.taskDescription = taskDescription;
        this.taskStartDate = taskStartDate;
        this.taskEndDate = taskEndDate;
        this.taskOwner = taskOwner;
    }

    // Getters
    public int getTaskID() { return taskID; }
    public String getTaskName() { return taskName; }
    public String getTaskDescription() { return taskDescription; }
    public String getTaskStartDate() { return taskStartDate; }
    public String getTaskEndDate() { return taskEndDate; }
    public String getTaskOwner() { return taskOwner; }

    // ✅ Setters (required for JSON deserialization)
    public void setTaskID(int taskID) { this.taskID = taskID; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    public void setTaskDescription(String taskDescription) { this.taskDescription = taskDescription; }
    public void setTaskStartDate(String taskStartDate) { this.taskStartDate = taskStartDate; }
    public void setTaskEndDate(String taskEndDate) { this.taskEndDate = taskEndDate; }
    public void setTaskOwner(String taskOwner) { this.taskOwner = taskOwner; }
}
