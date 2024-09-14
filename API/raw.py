from pymongo import MongoClient
from pandas import DataFrame

CONNECTION_STRING = "mongodb://127.0.0.1:27017"

#retorna a colecaco de dados do medidor
def getDbData():
    
    client = MongoClient(CONNECTION_STRING)
    db = client["meuBanco"]
    return db.medidorData

#insere no banco de dados um elemento especifico
def insertInDb(dados):

    diaHora = dados['_id'].split('|')
    data = diaHora[0].split('/')
    tempo = diaHora[1].split(':')
    dados['hora'] = tempo[0]
    dados['dia'] = data[0]
    dados['mes'] = data[1]
    dados['ano'] = data[2]
    getDbData().insert_one(dados)

#retorna um elemento especifico do colecao atraves do filtro
def getItensByFilter(filter):

    return getDbData().find_one(filter)

#retorna todos os dados disponiveis dentro desta colecao
def getAllItens():
    itens = getDbData().find()
    dic = {}

    for item in itens:
        dic[item['_id']] = item  #adiciona o id como chave para facil

    return dic

#atualiza os valores de um determinado iten, lembrando que o id e imutavel
def updateItenByFilter(filter, newData):
    getDbData().find_one_and_update(filter,{"$set":newData})

#deleta um iten atraves do filtro
def deleteItenByFilter(filter):
    getDbData().delete_one(filter)
    

#dia=12/12/2012&hora=22:22:22&tempB=20.5&tempA=26.7&tensao=0&corrente=9.0