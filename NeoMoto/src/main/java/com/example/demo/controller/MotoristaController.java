package com.example.demo.controller;

import com.example.demo.entity.Motorista;
import com.example.demo.entity.Moto;
import com.example.demo.repository.MotoristaRepository;
import com.example.demo.repository.MotoRepository;
import com.example.demo.dto.MotoristaDTO;
import com.example.demo.util.DTOConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/motoristas")
@CrossOrigin(origins = "*")
public class MotoristaController {

    @Autowired
    private MotoristaRepository motoristaRepository;
    
    @Autowired
    private MotoRepository motoRepository;

    // GET - Listar todos os motoristas
    @GetMapping
    public List<MotoristaDTO> getAllMotoristas() {
        List<Motorista> motoristas = motoristaRepository.findAll();
        return DTOConverter.toDTOList(motoristas);
    }

    // GET - Buscar motorista por ID
    @GetMapping("/{id}")
    public ResponseEntity<MotoristaDTO> getMotoristaById(@PathVariable Long id) {
        Optional<Motorista> motorista = motoristaRepository.findById(id);
        if (motorista.isPresent()) {
            return ResponseEntity.ok(DTOConverter.toDTO(motorista.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // GET - Buscar motoristas por status
    @GetMapping("/status/{status}")
    public List<MotoristaDTO> getMotoristasByStatus(@PathVariable String status) {
        List<Motorista> motoristas = motoristaRepository.findByStatus(status);
        return DTOConverter.toDTOList(motoristas);
    }

    // GET - Buscar motoristas por moto
    @GetMapping("/moto/{motoId}")
    public List<MotoristaDTO> getMotoristasByMoto(@PathVariable Long motoId) {
        List<Motorista> motoristas = motoristaRepository.findByMotoId(motoId);
        return DTOConverter.toDTOList(motoristas);
    }

    // POST - Criar novo motorista
    @PostMapping
    public ResponseEntity<?> createMotorista(@RequestBody Motorista motorista) {
        try {
            // Verificar se CPF já existe
            if (motoristaRepository.findByCpf(motorista.getCpf()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\":\"CPF já cadastrado\"}");
            }
            
            // Verificar se email já existe
            if (motoristaRepository.findByEmail(motorista.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\":\"Email já cadastrado\"}");
            }
            
            // Definir status padrão se não informado
            if (motorista.getStatus() == null || motorista.getStatus().isEmpty()) {
                motorista.setStatus("ativo");
            }
            
            Motorista motoristasSalvo = motoristaRepository.save(motorista);
            return ResponseEntity.ok(DTOConverter.toDTO(motoristasSalvo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\":\"Erro ao salvar motorista: " + e.getMessage() + "\"}");
        }
    }

    // POST - Associar motorista a uma moto
    @PostMapping("/{motoristaId}/moto/{motoId}")
    public ResponseEntity<Motorista> associarMotoAoMotorista(@PathVariable Long motoristaId, @PathVariable Long motoId) {
        Optional<Motorista> optionalMotorista = motoristaRepository.findById(motoristaId);
        Optional<Moto> optionalMoto = motoRepository.findById(motoId);
        
        if (optionalMotorista.isPresent() && optionalMoto.isPresent()) {
            Motorista motorista = optionalMotorista.get();
            Moto moto = optionalMoto.get();
            
            motorista.setMoto(moto);
            return ResponseEntity.ok(motoristaRepository.save(motorista));
        }
        
        return ResponseEntity.notFound().build();
    }

    // PUT - Atualizar motorista
    @PutMapping("/{id}")
    public ResponseEntity<Motorista> updateMotorista(@PathVariable Long id, @RequestBody Motorista motoristaDetails) {
        Optional<Motorista> optionalMotorista = motoristaRepository.findById(id);
        
        if (optionalMotorista.isPresent()) {
            Motorista motorista = optionalMotorista.get();
            motorista.setNome(motoristaDetails.getNome());
            motorista.setTelefone(motoristaDetails.getTelefone());
            motorista.setEmail(motoristaDetails.getEmail());
            motorista.setCnh(motoristaDetails.getCnh());
            motorista.setEndereco(motoristaDetails.getEndereco());
            motorista.setStatus(motoristaDetails.getStatus());
            
            return ResponseEntity.ok(motoristaRepository.save(motorista));
        }
        
        return ResponseEntity.notFound().build();
    }

    // DELETE - Deletar motorista
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMotorista(@PathVariable Long id) {
        Optional<Motorista> motorista = motoristaRepository.findById(id);
        
        if (motorista.isPresent()) {
            motoristaRepository.delete(motorista.get());
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }

    // DELETE - Desassociar motorista da moto
    @DeleteMapping("/{motoristaId}/moto")
    public ResponseEntity<Motorista> desassociarMotoDoMotorista(@PathVariable Long motoristaId) {
        Optional<Motorista> optionalMotorista = motoristaRepository.findById(motoristaId);
        
        if (optionalMotorista.isPresent()) {
            Motorista motorista = optionalMotorista.get();
            motorista.setMoto(null);
            return ResponseEntity.ok(motoristaRepository.save(motorista));
        }
        
        return ResponseEntity.notFound().build();
    }
}
