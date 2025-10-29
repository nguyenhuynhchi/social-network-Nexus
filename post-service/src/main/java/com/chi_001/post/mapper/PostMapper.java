package com.chi_001.post.mapper;

import com.chi_001.post.dto.response.PostResponse;
import com.chi_001.post.entity.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponse toPostResponse(Post post);
}
