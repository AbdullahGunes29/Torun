# # app/trendyol_mock.py
# import json

# def get_trendyol_products() -> str:
#     """
#     Kullanıcının Trendyol mağazasındaki aktif ürünleri listeler.
#     Kullanıcı 'ürünlerimi listele', 'neler satıyorum' dediğinde bu aracı kullan.
#     """
#     mock_data = [
#         {"id": 101, "name": "Ahşap Katlanır Sandalye", "price": 450, "stock": 12},
#         {"id": 102, "name": "Bambu Çiçeklik", "price": 250, "stock": 5},
#         {"id": 103, "name": "Seramik Kahve Fincanı", "price": 120, "stock": 0}
#     ]
#     return json.dumps(mock_data, ensure_ascii=False)

# def delete_trendyol_product(product_id: int) -> str:
#     """
#     Verilen ID'ye sahip ürünü Trendyol mağazasından siler.
#     Kullanıcı bir ürünü silmek istediğinde önce ID'sini bulup bu aracı kullan.
#     """
#     return f"{product_id} ID'li ürün başarıyla Trendyol'dan silindi."

# def analyze_product_reviews(product_id: int) -> str:
#     """
#     Verilen ürün ID'si için Trendyol'daki müşteri yorumlarını analiz eder ve özetler.
#     Kullanıcı 'yorumları analiz et', 'müşteriler ne diyor' dediğinde bu aracı kullan.
#     """
#     if product_id == 101:
#         return "Yorum Analizi: Müşterilerin %80'i ürünün kalitesinden çok memnun. Ancak %20'si kargolama süresinin uzun olmasından şikayetçi."
#     elif product_id == 103:
#         return "Yorum Analizi: Stokta olmayan bu ürün için eskiden 'çok kırılgan' şikayetleri gelmiş."
#     else:
#         return "Bu ürün için henüz yeterli müşteri yorumu bulunmuyor."