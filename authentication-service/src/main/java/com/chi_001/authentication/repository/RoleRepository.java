package com.chi_001.authentication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chi_001.authentication.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {}
