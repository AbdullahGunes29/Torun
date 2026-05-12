# OLD_MONEY-MOD
## Hackathon 26 için HürTech ekibimiz üyeleri olarak

- Musa IŞIL
- Abdullah GÜNEŞ
- Muhammet Salih ACAR
 
---

   Geliştirmeye başladığımız projemiz OLD_MONEY MOD: Yaşlı bireylerin e-ticaret sektöründe günümüz gelişen teknolojisinde ayakta kalabilecekleri AI desteği ile kullanıcı dostu, kolay ve anlaşılır arayüz ve pek çok işlemin teknik bilgi gererktirmeden yapılabileceği bir ortam sunmayı hedefelemekte.   
---

## Proje kapsamında ilk hedeflerimiz

- AI asistan ile doğrudan sohbet edip işlerini asitana yaptırabilecekleri ve karmaşık menülerde gezinip işlemleri yapma zorluğunu asistana devredebilcekler. Gerektiğinde AI ile sesli olarak da iletişişme geçebilecekler.
- Aynı zamanda AI asistana sattıkları ürünlerin yorumlarında kullanıcı deneyimini analiz etmelerini isteyip, profili geliştirmek adına asistan üzerinden tavsiye alabilecekler.
- Satmak istedikleri ürünlerin görselinden otamatik ürün açıklamsaı oluşturabilecekler.
- Satıcı profilinin karakteristik özelliklerinden yola çıkarak AI ile otomatik olarak sayfaları için logo tasarlayabilecer.

# Ekip için rehber 

### Kurulum
   Repoyu vscode üzerinde açtıktan sonraterminale şunaları yazarak uygulamayı çalıştırabilirsiniz:

1. python3 -m venv .venv (sanal ortam oluştur)
2. source .venv/bin/activate (sanal ortamı aktif et)
3. pip install -r requirements.txt (gerekli paketleri indir)
4. .env dosyası oluşturup içine GEMINI_API_KEY=(kişisel API keyinizi buraya yazın)
5. uvicorn app.main:app --reload" > (Backend çalıştıktan sonra http://127.0.0.1:8000/docs adresinden test edebilirsiniz.)