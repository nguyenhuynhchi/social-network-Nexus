package com.chi_001.authentication.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chi_001.authentication.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {}
