package com.example.demo.controller;

import com.example.demo.entity.Moto;
import com.example.demo.entity.Motorista;
import com.example.demo.repository.MotoRepository;
import com.example.demo.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/motos")
@CrossOrigin(origins = "*")
public class MotoController {

    @Autowired
    private MotoRepository motoRepository;
    
    @Autowired
    private MotoristaRepository motoristaRepository;

    @GetMapping
    public List<Moto> getAllMotos() {
        return motoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Moto> getMotoById(@PathVariable Long id) {
        Optional<Moto> moto = motoRepository.findById(id);
        if (moto.isPresent()) {
            return ResponseEntity.ok(moto.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/status/{status}")
    public List<Moto> getMotosByStatus(@PathVariable String status) {
        return motoRepository.findByStatus(status);
    }

    @GetMapping("/marca/{marca}")
    public List<Moto> getMotosByMarca(@PathVariable String marca) {
        return motoRepository.findByMarca(marca);
    }

    @PostMapping
    public ResponseEntity<?> createMoto(@RequestBody Moto moto) {
        try {
            if (moto.getX() == null) {
                moto.setX(Math.random() * 100);
            }
            if (moto.getY() == null) {
                moto.setY(Math.random() * 100);
            }
            
            if (moto.getStatus() == null || moto.getStatus().isEmpty()) {
                moto.setStatus("parada");
            }
            
            Moto motoSalva = motoRepository.save(moto);
            return ResponseEntity.ok(motoSalva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Erro ao salvar moto: " + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Moto> updateMoto(@PathVariable Long id, @RequestBody Moto motoDetails) {
        Optional<Moto> optionalMoto = motoRepository.findById(id);
        
        if (optionalMoto.isPresent()) {
            Moto moto = optionalMoto.get();
            moto.setName(motoDetails.getName());
            moto.setMarca(motoDetails.getMarca());
            moto.setConfiguracoes(motoDetails.getConfiguracoes());
            moto.setStatus(motoDetails.getStatus());
            
            if (motoDetails.getX() != null) {
                moto.setX(motoDetails.getX());
            }
            if (motoDetails.getY() != null) {
                moto.setY(motoDetails.getY());
            }
            
            return ResponseEntity.ok(motoRepository.save(moto));
        }
        
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMoto(@PathVariable Long id) {
        Optional<Moto> moto = motoRepository.findById(id);
        
        if (moto.isPresent()) {
            try {
                List<Motorista> motoristasComEstaMoto = motoristaRepository.findByMotoId(id);
                for (Motorista motorista : motoristasComEstaMoto) {
                    motorista.setMoto(null);
                    motoristaRepository.save(motorista);
                }
                
                motoRepository.delete(moto.get());
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("{\"error\":\"Erro ao excluir moto: " + e.getMessage() + "\"}");
            }
        }
        
        return ResponseEntity.notFound().build();
    }
}
