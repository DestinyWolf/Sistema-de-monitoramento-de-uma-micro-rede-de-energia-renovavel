from datetime import datetime

# Obter a data e hora atuais
data_e_hora_atuais = datetime.now()

# Obter a data atual (apenas data)
data_atual = data_e_hora_atuais.date()

# Imprimir a data atual
print("Data atual:", data_atual)