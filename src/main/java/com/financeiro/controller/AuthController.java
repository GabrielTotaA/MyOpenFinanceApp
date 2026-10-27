package com.financeiro.controller;

import com.financeiro.config.UsuarioLogado;
import com.financeiro.dto.LoginRequestDTO;
import com.financeiro.dto.LoginResponseDTO;
import com.financeiro.dto.RegistroRequestDTO;
import com.financeiro.dto.UsuarioResponseDTO;
import com.financeiro.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service){
        this.service = service;
    }

    @PostMapping("/registro")
    public UsuarioResponseDTO registrar(@Valid @RequestBody RegistroRequestDTO dto, HttpServletRequest request){
        return service.registrar(dto.nome(), dto.email(), dto.senha(), request.getRemoteAddr());
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO dto, HttpServletRequest request){
        return service.login(dto.email(), dto.senha(), request.getRemoteAddr());
    }

    @GetMapping("/me")
    public UsuarioResponseDTO me(@AuthenticationPrincipal Jwt jwt){
        return service.buscarUsuario(UsuarioLogado.id(jwt));
    }
}
