CREATE TABLE IF NOT EXISTS SENIORIDADE
(
    ID        INT         NOT NULL AUTO_INCREMENT,
    DESCRICAO VARCHAR(80) NOT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO SENIORIDADE(DESCRICAO)
VALUES ('Estagiário'),
       ('Júnior'),
       ('Pleno'),
       ('Sênior');