package com.financeiro.dto;

import com.financeiro.model.TipoTransacao;

import java.math.BigDecimal;

public record ResumoCategoriaDTO(String categoria, TipoTransacao tipo, BigDecimal total) {
}
