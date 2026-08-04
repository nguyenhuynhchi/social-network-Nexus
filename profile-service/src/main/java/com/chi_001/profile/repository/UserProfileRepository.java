package com.chi_001.profile.repository;

import com.chi_001.relationship.dto.FriendSuggestion;
import java.util.List;
import java.util.Set;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import com.chi_001.profile.entity.UserProfile;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends Neo4jRepository<UserProfile, String> {
    Optional<UserProfile> findByUserId(String userId);

    Set<UserProfile> findByUserIdIn(List<String> userIds);

    @Query("MATCH (a:user_profile {userId: $userId_1})-[r]->(b:user_profile {userId: $userId_2}) " +
        "RETURN TYPE(r) " +
        "LIMIT 1")
    Optional<String> findRelationshipType(String userId_1, String userId_2);

    //  Gửi yêu cầu kết bạn - Tạo mối quan hệ SENT_REQUEST_TO (A -> B)
    @Query("MATCH (a:user_profile {userId: $requesterId}), (b:user_profile {userId: $receiverId}) " +
        "MERGE (a)-[r:SENT_REQUEST_TO]->(b)")
    void createFriendRequest(String requesterId, String receiverId);

    //  Hủy yêu cầu kết bạn - Xóa mối quan hệ SENT_REQUEST_TO (A -> B)
    @Query("MATCH (a:user_profile {userId: $requesterId})-[r:SENT_REQUEST_TO]->(b:user_profile {userId: $receiverId}) " +
        "DELETE r ")
    void cancelFriendRequest(String requesterId, String receiverId);

    // Chấp nhận yêu cầu: Xóa SENT_REQUEST_TO (A -> B), tạo IS_FRIENDS_WITH (A <-> B)
    @Query("MATCH (a:user_profile {userId: $requesterId})-[r:SENT_REQUEST_TO]->(b:user_profile {userId: $receiverId}) " +
        "DELETE r " +
        "MERGE (a)-[:IS_FRIENDS_WITH]->(b) " +
        "MERGE (b)-[:IS_FRIENDS_WITH]->(a)")
    void acceptFriendRequest(String requesterId, String receiverId);

    // Từ chối yêu cầu: Xóa SENT_REQUEST_TO (A -> B)
    @Query("MATCH (a:user_profile {userId: $requesterId})-[r:SENT_REQUEST_TO]->(b:user_profile {userId: $receiverId}) " +
        "DELETE r ")
    void declineFriendRequest(String requesterId, String receiverId);

    //  Hủy kết bạn - Xóa mối quan hệ IS_FRIENDS_WITH
    @Query("MATCH (a:user_profile {userId: $userId1})-[r:IS_FRIENDS_WITH]-(b:user_profile {userId: $userId2}) " +
        "DELETE r")
    void removeFriendship(String userId1, String userId2);

    //  Gợi ý bạn bè dựa trên bạn chung (Friends of a Friend - FOAF)
    @Query("MATCH (me:user_profile {userId: $userId})-[:IS_FRIENDS_WITH]-(friend)-[:IS_FRIENDS_WITH]-(foaf) " +
        "WHERE NOT (me)-[:IS_FRIENDS_WITH]-(foaf) " +
        "AND NOT (me)-[:SENT_REQUEST_TO]-(foaf) " +
        "AND me <> foaf " +
        "RETURN foaf AS foaf, count(DISTINCT friend) AS commonFriends " +
        "ORDER BY commonFriends DESC " +
        "LIMIT $limit")
    List<FriendSuggestion> suggestFriends(String userId, int limit);

    //  Lấy danh sách bạn bè (IS_FRIENDS_WITH)
    @Query("MATCH (a:user_profile {userId: $userId})-[:IS_FRIENDS_WITH]-(friends) " +
        "RETURN DISTINCT friends")
    List<UserProfile> findAllFriendsByUserId(String userId);


    //  Lấy danh sách người đã gửi yêu cầu cho mình (SENT_REQUEST_TO -> Me)
    @Query("MATCH (requesters)-[:SENT_REQUEST_TO]->(b:user_profile {userId: $userId}) " +
        "RETURN requesters")
    List<UserProfile> findPendingRequestsByUserId(String userId);


    List<UserProfile> findAllByFullnameLike(String fullname);

}

