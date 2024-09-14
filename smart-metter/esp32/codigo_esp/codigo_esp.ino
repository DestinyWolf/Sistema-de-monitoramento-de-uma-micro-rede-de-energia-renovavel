#include <Arduino.h>

/*Biblioteca para fazer requisições HTTP*/
#include <HTTPClient.h>

/*Biblioteca para fazer comunicação WiFi*/
#include <WiFi.h>

/*Biblioteca para a comunicação serial Arduino - NodeMCU*/
#include <SoftwareSerial.h>

/*Biblioteca para captura do 'Timestamp'*/
#include <TimeLib.h>

/*Bibliotecas para serviços UDP e NTP*/
#include <WiFiUdp.h>
#include <NTPClient.h>



/*****************************************************************/
/************Objetos, variaveis, funções e constantes*************/
/*****************************************************************/

//PINO DO BOTAO:
#define BUTTON 15//D3

//VALOR DA MEDIÇÃO DIGITAL:
#define conversao 4.88758553

//SENSIBILIDADE DOS SENSORES:
#define sensibilidadeTensao 1000.0
#define sensibilidadeCorrente 185.0
#define sensibilidadeTemperatura 100.0
#define RX 18 //D18
#define TX 19 //D19

SoftwareSerial sender(RX, TX);  // RX, TX

//Servidor NTP usado para o 'timestamp':
static const char ntpServerName[] = "us.pool.ntp.org";
unsigned int localPort = 8888;

//Time-zone de São Paulo, Brasil:
const int timeZone = -3;

//Objeto WiFiUDP:
WiFiUDP Udp;

//Buffer para armazenar os pacotes de entrada e saída:
byte packetBuffer[NTP_PACKET_SIZE];

//Variavel para guarda o tempo da ultima leitura (para fins de cálculo da energia):
float pastTime = 0.0;

//Variavel que acumula a energia:
float energia = 0.0;

//flag para sinalizar qual mensagem o display irá exibir:
boolean flagDisplay = true;

//rotas das requisições:
String ipPc = "192.168.0.102:5000";

float tensao = 0.0, corrente = 0.0, tempA = 0.0, tempP = 0.0, potencia = 0.0, rad = 0.0;

//declaração das funções

void readData();
void setupWiFi(const char *ssid, const char *pass);
int readSerial();
float conversor(int analogVal, String sensor);
String sendRequest_(float tempA, float tempB, float corrente, float tensao);
String getDate();
String getTime();
time_t getNtpTime();
void sendNTPpacket(IPAddress &address);


void setup() {
  Serial.begin(115200);  //inicia comunicação serial com o computador
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);

  delay(1000);

  setupWiFi("Ark's Badroom network", "Arkpc123");  //inicia comunicação com o WiFi

  //inicia o objeto Udp na portal local informada (8888):
  Udp.begin(localPort);

  //Faz a sincronização do provedor para capturar o timestemp correto:
  setSyncProvider(getNtpTime);
  setSyncInterval(300);

  sender.begin(9600);  //inicia comunicação serial com arduino

  digitalWrite(LED_BUILTIN, LOW);

  digitalWrite(LED_BUILTIN, HIGH);
  delay(1800);
  sender.write(1);  // para avisar que está tudo certo é mandado um 1 para o arduino
  Serial.println(getDate());
  Serial.println(getTime());
  digitalWrite(LED_BUILTIN, LOW);
}

void loop() {

  boolean wasRead = false;

  if (sender.available()) {
    //avisa que um dado foi lido:
    wasRead = true;

    //Ler os dados:
    readData();
  }
  //Verifica se o WiFi está conectado:
  if (WiFi.status() == WL_CONNECTED) {
    //verifica se algum dado foi lido recentemente:
    if (wasRead) {
      //envia as requisições com os dados para o banco de dados:
      digitalWrite(LED_BUILTIN, LOW);
      Serial.println("Envio de dados. Resposta do servidor: " + sendRequest_(tempA, tempP, corrente, tensao));

        // para avisar que está tudo certo é mandado um 1 para o arduino
        sender.write(1);
      digitalWrite(LED_BUILTIN, HIGH);
    }
  } else {
    if (wasRead) {
      Serial.println("WiFi não conectado. Não foi possível enviar requisições");
      int i = 0;
      while (i < 10) {
        digitalWrite(LED_BUILTIN, LOW);
        delay(500);
        digitalWrite(LED_BUILTIN, HIGH);
        delay(500);
        i++;
      }
    }
  }


  if (!digitalRead(BUTTON)) {
    flagDisplay = !flagDisplay;
  }
  delay(300);
}

/*
 * Faz a leitura e conversão dos valores a partir da comunicação serial
 */
void readData() {

  digitalWrite(LED_BUILTIN, LOW);
  int t = readSerial();
  delay(1);
  int c = readSerial();
  delay(1);
  int tpa = readSerial();
  delay(1);
  int tpp = readSerial();
  delay(1);
  //captura e converte as leituras de tensao, corrente, e temperaturas.:
  tensao = conversor(t, "tensao") / sensibilidadeTensao;
  corrente = conversor(c, "corrente") / sensibilidadeCorrente;
  tempA = conversor(tpa, "temperatura1") / sensibilidadeTemperatura;
  tempP = conversor(tpp, "temperatura2") / sensibilidadeTemperatura;

  //calcula a potência a partir da corrente e tensão lidas:
  potencia = tensao * corrente;

  //Verifica o intervalo de leitura para calcular a energia:
  float interval = 0.0;
  if (pastTime != 0.0) {
    interval = (millis() - pastTime) / 3600000;
  }

  //calcula a energia com o intervalo encontrado e a potência:
  energia = energia + (potencia * interval);

  //calcula a radiação:
  rad = 0.0;

  //captura o instante que a leitura foi feita:
  pastTime = millis();

  //prints para depuração pelo monitor serial:
  Serial.println("V: " + String(tensao) + " I: " + String(corrente) + " T1: " + String(tempA));
  Serial.println(" T2: " + String(tempP) + " P: " + String(potencia) + " E: " + String(energia));
  digitalWrite(LED_BUILTIN, HIGH);
}

/*
 * Realiza a comunicação com o WiFi.
 * 
 */
void setupWiFi(const char *ssid, const char *pass) {
  Serial.print("\nTentando conexão com WiFi ");

  WiFi.begin(ssid, pass);

  digitalWrite(LED_BUILTIN, LOW);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(". ");
  }

  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("\nConectado ao WiFi " + String(ssid));
}

/*
 * Faz a leitura de um dado da porta serial até encontrar uma vírgula.
 * Após capturar o dado o transforma em inteiro.
 * 
 * return:
 *    Retorna o dado que foi lido, já convertido em inteiro.
 */
int readSerial() {
  String val;
  val = sender.readStringUntil('\n');

  Serial.println("Valor recebido: ");
  Serial.println(val);
  return atoi(val.c_str());
}

/*
 * Converte um valor analogico ( ex: 1023) em um valor de tensão equivalente.
 * 
 * Parâmetros:
 *  analogVal -> valor analógico à ser convertido.
 *  sensor    -> nome do sensor que vai ser feito a conversão.
 * 
 * return:
 *  retorna o valor convertido em tensão.
 * 
 */
float conversor(int analogVal, String sensor) {
  if (sensor == "corrente")
    return (analogVal - 512) * conversao;
  else
    return analogVal * conversao;
}

/*
 * Faz uma requisição http por meio de arquivos PHP para adicionar um dado ao banco de dados
 * 
 * Parâmetros:
 *  data -> dado que será guardado no banco de dados.
 *  file -> arquivo que contém o código php com a requisição.
 *  
 * return:
 *  retorna a resposta da requisição 'get' feita.
 *    se == 200 -> requisição bem sucedida.
 *    se != 200 -> requisição com problemas.
 */
String sendRequest_(float tempA, float tempB, float corrente, float tensao) {
  HTTPClient http;

  //Inicia o objeto http com a rota e os dados da requisição get( o valor, a data e a hora):
  http.begin("http://" + ipPc + "/insert?data=" + getDate() + "&hora=" + getTime() + "&tempA=" + String(tempA) + "&tempB=" + String(tempB) + "&tensao=" + String(tensao) + "&corrente=" + String(corrente)+"&potencia=" +String(potencia) + "&energia=" + String(energia));

  //envia a requisição:
  int httpCode = http.GET();

  //encerra a comunicação:
  http.end();

  //retorna a resposta da requisição get:
  return String(httpCode);
}

/*
 * Captura a data atual e faz uma conversão para String, adicionando 0's onde necessário
 * 
 * return:
 *  uma string contendo a data atual
 *    ex: 30/06/2021
 */
String getDate() {
  String day_, month_;
  if (day() < 10)
    day_ = "0" + String(day());
  else
    day_ = String(day());

  if (month() < 10)
    month_ = "0" + String(month());
  else
    month_ = String(month());

  return day_ + "/" + month_ + "/" + year();
}

/*
 * Captura o horário atual e faz uma conversão para String, adicionando 0's onde necessário
 * 
 * return:
 *  uma string contendo a data atual
 *    ex: 17:50:32
 */
String getTime() {
  String hour_, minute_, second_;
  if (hour() < 10)
    hour_ = "0" + String(hour());
  else
    hour_ = String(hour());
  if (minute() < 10)
    minute_ = "0" + String(minute());
  else
    minute_ = String(minute());
  if (second() < 10)
    second_ = "0" + String(second());
  else
    second_ = String(second());

  return hour_ + ":" + minute_ + ":" + second_;
}


/*
 * Procedimento que faz a sincronização com o provedor para captura da hora e data.
 * 
 * return:
 *    Retorna os segundos, desde 1970 até o instante foi chamada.
 *    Retorna 0 se não conseguir sincronizar.
 */
time_t getNtpTime() {
  IPAddress ntpServerIP;  //enderço IP do servidor NTP

  //descartar todos os pacotes recebidos anteriormente
  while (Udp.parsePacket() > 0)
    ;
  // obtém um servidor aleatório do pool
  WiFi.hostByName(ntpServerName, ntpServerIP);

  //Envia uma solicitação NTP para o servidor obtido aleatóriamente:
  sendNTPpacket(ntpServerIP);

  //Permanece no loop por 1500 ms:
  uint32_t beginWait = millis();
  while (millis() - beginWait < 1500) {
    int size = Udp.parsePacket();
    if (size >= NTP_PACKET_SIZE) {
      //ler o pacote no buffer Udp:
      Udp.read(packetBuffer, NTP_PACKET_SIZE);
      unsigned long secsSince1900;
      // Converte quatro bytes começando na localização 40 em um long int:
      secsSince1900 = (unsigned long)packetBuffer[40] << 24;
      secsSince1900 |= (unsigned long)packetBuffer[41] << 16;
      secsSince1900 |= (unsigned long)packetBuffer[42] << 8;
      secsSince1900 |= (unsigned long)packetBuffer[43];
      return secsSince1900 - 2208988800UL + timeZone * SECS_PER_HOUR;
    }
  }

  return 0;  // Retorna 0 se não for possível obter a hora
}

/*
 * Envia uma solicitação NTP para o servidor de horário no endereço fornecido
 * 
 * Parâmetros:
 *    endereço IP do servidor.
 */
void sendNTPpacket(IPAddress &address) {
  // Setta todos os bytes no buffer para 0:
  memset(packetBuffer, 0, NTP_PACKET_SIZE);

  // Inicializa os valores necessários para formar a solicitação NTP:
  packetBuffer[0] = 0b11100011;  // LI, versão, modo
  packetBuffer[1] = 0;           // estrado, ou tipo de clock
  packetBuffer[2] = 6;           // Intervalo de votação
  packetBuffer[3] = 0xEC;        // Peer Clock Precision
  // 8 bytes de zero para Root Delay e Root Dispersion
  packetBuffer[12] = 49;
  packetBuffer[13] = 0x4E;
  packetBuffer[14] = 49;
  packetBuffer[15] = 52;

  //Agora, envia um pacote solicitando um carimbo de data/hora:
  Udp.beginPacket(address, 123);  // Os pedidos NTP são para a porta 123
  Udp.write(packetBuffer, NTP_PACKET_SIZE);
  Udp.endPacket();
}