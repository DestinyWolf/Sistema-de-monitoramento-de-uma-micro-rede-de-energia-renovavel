import requests, json



arquivo = open("/home/kaki/Downloads/tableConvert.com_j00357.json", "rb")
dados = json.load(arquivo)
arquivo.close()
i =0


for dado in dados:
    print(f"dado: {i}")
    response = requests.get(f"http://127.0.0.1:5000/insert?data={dado['data']}&hora={dado['hora']}&tensao={dado['tensao']}&corrente={dado['corrente']}&tempB={dado['tempB']}&tempA={dado['tempA']}&energia={dado['energia']}&potencia={dado['potencia']}")
    print(response.text)
    i+=1




