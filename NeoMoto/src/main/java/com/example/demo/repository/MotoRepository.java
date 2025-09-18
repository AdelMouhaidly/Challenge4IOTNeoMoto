package com.example.demo.repository;

import com.example.demo.entity.Moto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MotoRepository extends JpaRepository<Moto, Long> {
    List<Moto> findByStatus(String status);
    List<Moto> findByMarca(String marca);
}
