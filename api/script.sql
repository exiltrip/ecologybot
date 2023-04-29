create table applications
(
    telegramid varchar(100),
    fio        varchar(255),
    age        varchar(255),
    aboutme    varchar(955)
);

alter table applications
    owner to postgres;

create table users
(
    telegramid varchar(100),
    username   varchar(255),
    role       varchar(100) default USER,
    id         integer
);

alter table users
    owner to postgres;

