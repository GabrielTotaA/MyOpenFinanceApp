package com.financeiro.repository;

import com.financeiro.dto.ResumoCategoriaDTO;
import com.financeiro.model.Categoria;
import com.financeiro.model.Transacao;
import com.financeiro.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao,Long> {
    long countByCategoria(Categoria categoria);

    @Query("SELECT t FROM Transacao t JOIN FETCH t.categoria WHERE t.usuario = :usuario")
    List<Transacao> findByUsuario(@Param("usuario") Usuario usuario);

    @Query("SELECT t FROM Transacao t JOIN FETCH t.categoria WHERE t.usuario = :usuario AND t.data BETWEEN :inicio AND :fim")
    List<Transacao> findByUsuarioEPeriodo(@Param("usuario") Usuario usuario,
                                          @Param("inicio") LocalDate inicio,
                                          @Param("fim") LocalDate fim);

    @Query("SELECT new com.financeiro.dto.ResumoCategoriaDTO(t.categoria.nome, t.tipo, SUM(t.valor)) " +
            "FROM Transacao t WHERE t.usuario = :usuario AND t.data BETWEEN :inicio AND :fim " +
            "GROUP BY t.categoria.nome, t.tipo")
    List<ResumoCategoriaDTO> somarPorCategoria(@Param("usuario") Usuario usuario,
                                               @Param("inicio") LocalDate inicio,
                                               @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.tipo = com.financeiro.model.TipoTransacao.ENTRADA THEN t.valor ELSE -t.valor END), 0) " +
            "FROM Transacao t WHERE t.usuario = :usuario")
    BigDecimal calcularSaldoTotal(@Param("usuario") Usuario usuario);
}
