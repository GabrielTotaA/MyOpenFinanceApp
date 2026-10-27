package com.financeiro.exception;

public class TransacaoNaoEncontradaException extends RuntimeException{
    public TransacaoNaoEncontradaException(String mensagem){
        super (mensagem);
    }
}
