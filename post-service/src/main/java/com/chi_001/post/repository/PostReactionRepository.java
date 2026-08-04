package com.chi_001.post.repository;

import com.chi_001.post.entity.PostReaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostReactionRepository extends MongoRepository<PostReaction, String> {

    // Tìm kiếm tất cả các Reactions cho một Post (sắp xếp theo thời gian tạo)
    List<PostReaction> findAllByPostIdOrderByCreatedDateDesc(String postId);

    // Kiểm tra người dùng đã thả reaction cho bài viết chưa
    Optional<PostReaction> findByPostIdAndUserId(String postId, String userId);
}
