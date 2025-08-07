package com.example.models;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

public class Post {
    private String postID;
    private String postName;
    private String postDescription;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate postDate;

    private String postOwner;
    private Long postComments;
    private Long postLikes;

     // No-arg constructor
    public Post() {
    }

    public Post(String postID, String postName, String postDescription, LocalDate postDate, String postOwner, Long postComments, Long postLikes) {
        this.postID = postID;
        this.postName = postName;
        this.postDescription = postDescription;
        this.postDate = postDate;
        this.postOwner = postOwner;
        this.postComments = postComments;
        this.postLikes = postLikes;
    }

    // Getters
    public String getPostID() { return postID; }
    public String getPostName() { return postName; }
    public String getPostDescription() { return postDescription; }
    public LocalDate getPostDate() { return postDate; }
    public String getPostOwner() { return postOwner; }
    public Long getPostComments() { return postComments; }
    public Long getPostLikes() { return postLikes; }

    // Setters
    public void setPostID(String postID) { this.postID = postID; }
    public void setPostName(String postName) { this.postName = postName; }
    public void setPostDescription(String postDescription) { this.postDescription = postDescription; }
    public void setPostDate(LocalDate postDate) { this.postDate = postDate; }
    public void setPostOwner(String postOwner) { this.postOwner = postOwner; }
    public void setPostComments(Long postComments) { this.postComments = postComments; }
    public void setPostLikes(Long postLikes) { this.postLikes = postLikes; }
}
