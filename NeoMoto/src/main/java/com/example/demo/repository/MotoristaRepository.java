package com.example.demo.repository;

import com.example.demo.entity.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
    List<Motorista> findByStatus(String status);
    Optional<Motorista> findByCpf(String cpf);
    Optional<Motorista> findByEmail(String email);
    List<Motorista> findByMotoId(Long motoId);
}
