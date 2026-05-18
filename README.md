# Torun
## Hackathon 26 için HürTech ekibimiz üyeleri olarak

- Musa IŞIL
- Abdullah GÜNEŞ
- Muhammet Salih ACAR


---
   Geliştirmeye başladığımız projemiz **Torun**: Yaşlı bireylerin e-ticaret sektöründe günümüz gelişen teknolojisinde ayakta kalabilecekleri AI desteği ile kullanıcı dostu, kolay ve anlaşılır arayüz ve pek çok işlemin teknik bilgi gererktirmeden yapılabileceği bir ortam sunmayı hedefelemekte. Kurumsal e-ticaret firmalarında satıcı profilleri bulunun bireyler satıcı profillerinini kolaylıkla yönetebilecekler. Kullanıcılar Trendyol gibi platformlarında bulunan satıcı profilleri aracılığıyla aldıkları API keys ile sisteme kayıt olduklarında sistemimizi rahatlıkla kullanabilecekler. Kurduğumuz agentic yapı sayesinde Torun asistanımız işlemleri kullanıcın emirleri doğrultusunda daha kolay ve hızlı bir şekilde gerçekleştirebilmekte.  
---
   Projemizi Hackathon 26 için geliştirdiğimizden dolayı kısıtlı sürede kurumsal platformlarda satıcı profili oluşturmamız mümkün değildi. Bizde vizyonumuzu koruyarak **Torun**'u  kendi girdiğimiz vverilerle geliştirdik. İlerleyen süreçete Trandyol gibi platformlarda kullanılabilecek bir sistemin demosunu geliştirmeyi hedefledik.
---

## Proje kapsamında ilk hedeflerimiz

- AI asistan ile doğrudan sohbet edip işlerini asitana yaptırabilecekleri ve karmaşık menülerde gezinip işlemleri yapma zorluğunu asistana devredebilcekleri bir sistem kurmak hedeflenmekte.
- Kullanıcılar AI asistan sayesinde satmak istedikleri ürünlerin görselinden otamatik ürün adı, ürün açıklaması ve ürünün fiyatını oluşturabilecekler.
- Kullanıcılar ürün ekleme, ürün listeleme gibi işlemleri AI asistan Torun'a yaptırabildikleri gibi manuel olarakta bu işlemleri gerçekleştirebilecekler. 

---

# NOT
   Projenin güncel hali varsayılan **main** branch'ıdır. Değerlendirmelerinizde **main**'i dikkate alın lütfen! 

# Ekip için rehber 

### Kurulum
   vscode uygulamasını açtıktan sonra terminale şunaları yazarak uygulamayı çalıştırabilirsiniz:

1. Docker Desktop:** [Buradan indirip](https://www.docker.com/products/docker-desktop/) kurun ve çalıştırın (Balina ikonu yeşil olmalı).
2. git clone https://github.com/AbdullahGunes29/Torun.git (terminalde çalıştır)
3. cd Torun (terminalde çalıştır)
5. Ana dizinde bir .env dosyası oluşturun: ve içine "GEMINI_API_KEY=api_anahtarin"
6. docker-compose up --build (terminalde çalıştır)
7. Sunucu "Application startup complete" yazısını verdikten sonra tarayıcınızdan şu adrese giderek dükkanı kontrol edebilirsiniz: http://localhost:8000/docs (backend) , http://localhost:5173 (frontend)