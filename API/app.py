from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime, timedelta
from pickle import dump, load
from pathlib import Path

CONNECTION_STRING = "mongodb://127.0.0.1:27017"


def getDbData():
    
    client = MongoClient(CONNECTION_STRING)
    db = client.get_database("meuBanco")

    return db.get_collection("medidorData")

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
    response = getDbData().find(filter)
    if (response):
        return response
    else:
        return False
    

def saveOnFile(data):
    file = Path('cache.dat');

    with file.open('wb') as f:
        dump(data, f)
        

def loadFromFile():
    file = Path('cache.dat')
    if file.exists():
        with file.open('rb') as f:
            return load(f)
    else:
        data = {}
        data['isChange'] = False
        with file.open('wb') as f:
            dump(data, f)
            return data



#retorna todos os dados disponiveis dentro desta colecao
def getAllItens():
    itens = getDbData().find()
    dic = {}

    for item in itens:
        dic[item['_id']] = item  #adiciona o id como chave para facil

    return dic


app = Flask(__name__)
CORS(app)
api  = Api(app)

#
class DataInsert(Resource):

    def get(self):
        args = request.args
        data = args.get('data', type=str)
        hora = args.get('hora', type=str)
        tempA = args.get('tempA', type=float)
        tempB = args.get('tempB', type=float)
        tensao = args.get('tensao', type=float)
        corrente = args.get('corrente', type=float)
        potencia = args.get( 'potencia', type=float)
        energia = args.get( 'energia' ,type=float)

        newData = {
            '_id' : "|".join([data,hora]),
            'data': data,
            'tempo': hora,
            'tempA': tempA,
            'tempB': tempB,
            'tensao': tensao,
            'corrente': corrente,
            'potencia': potencia,
            'energia': energia
        }

        hasUpdate = {'isChange':True}

        saveOnFile(hasUpdate)

        insertInDb(newData)

        return {"message":"dados inseridos com sucesso id: " + newData['_id']}


class Data(Resource):

    def get(self):
        return(jsonify(getAllItens()))

        

api.add_resource(Data, '/data')
api.add_resource(DataInsert, '/insert') 

@app.route('/')
def home():
    return "<p>a api esta no ar</p>"

@app.route('/data/last')
def returnLastData():
    data = getDbData().find()
    day = ''
    dic = {}
    for item in data:
        day = item['data']
    

    itens = getItensByFilter({'data':day})

    for item in itens:
        dic[item['_id']] = item
    
    return jsonify(dic)

@app.route('/data/date')
def returnForDate():
    args = request.args
    data1 = args.get("data1", type=str).split('/')
    data2 = args.get("data2", type=str).split('/')
    dic = {}

    itens1 = getItensByFilter({'mes':data1[1], 'ano':data1[2]})
    itens2 = getItensByFilter({'mes':data2[1], 'ano':data2[2]})

    for item in itens1:
        if(item["dia"] >= data1[0]):
            dic[item["_id"]] = item
        
    for item in itens2:
        if(item["dia"] <= data2[0]):
            dic[item["_id"]] = item

    return jsonify(dic)

@app.route('/data/day')
def returnForDay():
    args = request.args
    data = args.get("data", type=str)
    itens = getItensByFilter({'data':data})
    dic = {}

    if(itens):
        for item in itens:
            dic[item['_id'] ] = item  #adiciona o id como chave para facil
    else:
        dic["error"] = False

    return jsonify(dic)


@app.route('/data/month')
def returnForMonth():
    args = request.args
    dataStart = args.get("dataStart", type=str)
    dataFinish = args.get("dataFinish", type=str)
    itens = getItensByFilter({"data":dataStart})
    dic = {}

    for item in itens:
        dic[item['_id']] = item  #adiciona o id como chave para facil

    dia = int(dataStart[0:2])
    mes = int(dataStart[3:5])
    ano =  int(dataStart[6:])

    data1 = datetime(ano, mes, dia)
    data2 = datetime(int(dataFinish[6:]), int(dataFinish[3:5]), int(dataFinish[0:2]))

    data1 = data1 + timedelta(days=1)
    

    while data1 <= data2:
        data_str = data1.strftime("%d/%m/%Y")

        itens = getItensByFilter({'data':data_str})

        for item in itens:
            dic[item['_id']] = item  #adiciona o id como chave para facil
        
        data1 = data1 + timedelta(days=1)

    return jsonify(dic)


@app.route('/data/annual')
def returnForAnnual():
    args = request.args
    annual = args.get("year", type=str)
    itens = getItensByFilter({"ano":annual})
    dic = {}

    for item in itens:
        
        dic[item['_id'] ] = item  #adiciona o id como chave para facil

    return jsonify(dic)

@app.route('/data/hour')
def returnForHour():


    args = request.args
    hora_atual = datetime.now()
    data_atual = hora_atual.date().strftime( '%d/%m/%Y' )
    hour = args.get("hour", type=str)
    itens = getItensByFilter({'data':data_atual,'hora':hour})
    dic = {}

    for item in itens:
        dic[item['_id']] = item  #adiciona o id como chave para facil

    return jsonify(dic)

@app.route('/data/ischange')
def returnIsUpdate():
    
    oldData = loadFromFile();
    newData = {'isChange':False}

    saveOnFile(newData);
    return jsonify(oldData);

if __name__ ==  '__main__':
    app.run(host='0.0.0.0')

