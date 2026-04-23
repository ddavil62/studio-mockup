"""
@fileoverview Travellers Rest 스타일(탑다운 + 사이드뷰 캐릭터) placeholder 에셋 생성.
Stardew Valley 계열 픽셀아트 패턴. V10 시험 시안용.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.dirname(os.path.abspath(__file__))


def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path)
    print(f"  -> {path}")


def floor_wood():
    """목재 마룻바닥 타일 (32x32, 가로 패턴)."""
    img = Image.new("RGBA", (32, 32), (165, 115, 70, 255))
    d = ImageDraw.Draw(img)
    # 가로 마룻판 라인 (8px 단위)
    for y in [8, 16, 24]:
        d.line([(0, y), (32, y)], fill=(115, 75, 45, 255))
    # 세로 이음매 (각 판마다 위치 다르게)
    d.line([(11, 0), (11, 8)], fill=(115, 75, 45, 255))
    d.line([(20, 8), (20, 16)], fill=(115, 75, 45, 255))
    d.line([(7, 16), (7, 24)], fill=(115, 75, 45, 255))
    d.line([(24, 24), (24, 32)], fill=(115, 75, 45, 255))
    # 나뭇결 미세
    for y in [3, 11, 19, 27]:
        d.line([(2, y), (30, y)], fill=(150, 105, 65, 200))
    save(img, "floor_wood.png")


def wall_horizontal():
    """가로 두꺼운 벽 (64x24)."""
    img = Image.new("RGBA", (64, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 벽 본체 (어두운 갈색)
    d.rectangle([(0, 0), (63, 18)], fill=(85, 55, 35, 255))
    # 상단 하이라이트
    d.rectangle([(0, 0), (63, 2)], fill=(110, 75, 50, 255))
    # 나뭇결 라인
    for x in [10, 22, 34, 46, 58]:
        d.line([(x, 2), (x, 18)], fill=(60, 40, 25, 255))
    # 하단 그림자 (벽 두께 표현)
    d.rectangle([(0, 18), (63, 23)], fill=(45, 30, 20, 255))
    d.line([(0, 18), (63, 18)], fill=(30, 20, 15, 255))
    save(img, "wall_horizontal.png")


def bench_long():
    """긴 벤치 사이드뷰 (96x14, 측면에서 본 모양)."""
    img = Image.new("RGBA", (96, 14), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 좌석면
    d.rectangle([(0, 0), (95, 4)], fill=(150, 95, 55, 255), outline=(80, 50, 25, 255))
    # 좌석면 하이라이트
    d.line([(1, 1), (94, 1)], fill=(180, 125, 80, 255))
    # 다리 4개
    for x in [4, 30, 62, 88]:
        d.rectangle([(x, 4), (x + 4, 13)], fill=(95, 60, 30, 255), outline=(50, 30, 15, 255))
    save(img, "bench_long.png")


def table_long():
    """긴 테이블 탑다운 (96x40)."""
    img = Image.new("RGBA", (96, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 테이블 상판 (탑다운)
    d.rectangle([(2, 2), (93, 36)], fill=(135, 85, 50, 255), outline=(60, 40, 20, 255))
    # 상판 나뭇결 (가로 라인)
    for y in [8, 14, 20, 26, 32]:
        d.line([(4, y), (91, y)], fill=(115, 70, 40, 200))
    # 상판 하이라이트
    d.line([(2, 3), (93, 3)], fill=(165, 110, 70, 255))
    # 짧은 측면 표현 (하단 1~2px만)
    d.rectangle([(2, 36), (93, 39)], fill=(70, 45, 25, 255))
    save(img, "table_long.png")


def table_food_plate():
    """테이블 위 음식 접시 1개 (16x16, 탑다운)."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 접시 외곽 (흰색 원)
    d.ellipse([(1, 2), (14, 13)], fill=(240, 235, 225, 255), outline=(120, 115, 105, 255))
    # 접시 안쪽 음식 (갈색)
    d.ellipse([(4, 5), (11, 10)], fill=(180, 100, 50, 255), outline=(100, 55, 25, 255))
    save(img, "table_food_plate.png")


def table_mug():
    """맥주잔 (8x10, 탑다운)."""
    img = Image.new("RGBA", (8, 10), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 잔 본체
    d.ellipse([(1, 2), (6, 8)], fill=(220, 180, 100, 255), outline=(130, 95, 50, 255))
    # 거품
    d.ellipse([(2, 1), (5, 4)], fill=(245, 235, 210, 255), outline=(180, 165, 130, 255))
    save(img, "table_mug.png")


def customer_side_seated():
    """앉은 손님 (사이드뷰 풀바디, 16x22).

    측면에서 본 좌석 자세. 엉덩이는 벤치 위, 다리는 벤치 앞 바닥에 자연스럽게 박힘.
    """
    img = Image.new("RGBA", (16, 22), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 머리 (측면)
    d.ellipse([(4, 0), (12, 7)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 머리카락 뒤쪽
    d.rectangle([(4, 0), (10, 4)], fill=(80, 50, 30, 255))
    # 눈 (측면이라 1개)
    d.point((9, 4), fill=(20, 20, 20, 255))
    # 코 (살짝 튀어나옴)
    d.point((12, 4), fill=(220, 180, 145, 255))
    # 몸통 (측면, 셔츠)
    d.polygon([(5, 7), (11, 7), (12, 14), (4, 14)], fill=(80, 130, 200, 255), outline=(40, 70, 130, 255))
    # 팔 (앞쪽으로 뻗어 테이블 쪽)
    d.rectangle([(11, 9), (14, 12)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 엉덩이 (벤치 위에 안착되는 부분)
    d.rectangle([(4, 13), (12, 16)], fill=(60, 45, 80, 255), outline=(35, 25, 50, 255))
    # 다리 (벤치 앞으로 떨어짐)
    d.rectangle([(5, 16), (8, 21)], fill=(60, 45, 80, 255), outline=(35, 25, 50, 255))
    d.rectangle([(9, 16), (12, 21)], fill=(60, 45, 80, 255), outline=(35, 25, 50, 255))
    save(img, "customer_side_seated.png")


def customer_side_walking():
    """걷는 손님 (사이드뷰 풀바디, 16x24)."""
    img = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 머리
    d.ellipse([(4, 0), (12, 7)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    d.rectangle([(4, 0), (10, 4)], fill=(80, 50, 30, 255))
    d.point((9, 4), fill=(20, 20, 20, 255))
    d.point((12, 4), fill=(220, 180, 145, 255))
    # 몸통
    d.polygon([(5, 7), (11, 7), (12, 14), (4, 14)], fill=(160, 80, 80, 255), outline=(100, 40, 40, 255))
    # 팔 (옆으로)
    d.rectangle([(3, 9), (5, 13)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    d.rectangle([(11, 9), (13, 13)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 다리 (걷기 자세 - 한쪽 앞)
    d.rectangle([(4, 14), (7, 22)], fill=(60, 60, 80, 255), outline=(30, 30, 45, 255))
    d.rectangle([(9, 14), (12, 22)], fill=(60, 60, 80, 255), outline=(30, 30, 45, 255))
    # 신발
    d.rectangle([(3, 22), (8, 23)], fill=(40, 30, 20, 255))
    d.rectangle([(8, 22), (13, 23)], fill=(40, 30, 20, 255))
    save(img, "customer_side_walking.png")


def chef_side():
    """셰프 사이드뷰 (16x24)."""
    img = Image.new("RGBA", (16, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 셰프 모자
    d.rectangle([(4, 0), (12, 4)], fill=(255, 255, 255, 255), outline=(180, 180, 180, 255))
    d.ellipse([(3, -2), (13, 3)], fill=(255, 255, 255, 255), outline=(180, 180, 180, 255))
    # 머리
    d.ellipse([(4, 4), (12, 11)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 눈
    d.point((9, 7), fill=(20, 20, 20, 255))
    # 셰프복
    d.polygon([(4, 11), (12, 11), (13, 18), (3, 18)], fill=(255, 255, 255, 255), outline=(160, 160, 160, 255))
    # 앞치마 끈
    d.line([(7, 12), (7, 17)], fill=(180, 180, 180, 255))
    # 팔
    d.rectangle([(11, 12), (14, 16)], fill=(255, 255, 255, 255), outline=(160, 160, 160, 255))
    # 바지
    d.rectangle([(4, 18), (7, 22)], fill=(50, 50, 60, 255), outline=(25, 25, 35, 255))
    d.rectangle([(9, 18), (12, 22)], fill=(50, 50, 60, 255), outline=(25, 25, 35, 255))
    # 신발
    d.rectangle([(3, 22), (8, 23)], fill=(30, 30, 35, 255))
    d.rectangle([(8, 22), (13, 23)], fill=(30, 30, 35, 255))
    save(img, "chef_side.png")


def counter_topdown():
    """카운터 탑다운 (96x32, 주방 영역)."""
    img = Image.new("RGBA", (96, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 카운터 상판 (스테인리스/원목)
    d.rectangle([(2, 2), (93, 24)], fill=(190, 165, 130, 255), outline=(95, 70, 45, 255))
    # 나뭇결
    for y in [8, 14, 20]:
        d.line([(4, y), (91, y)], fill=(155, 125, 95, 200))
    # 음식 표시 (도마, 냄비 등)
    d.rectangle([(8, 6), (20, 12)], fill=(220, 180, 130, 255), outline=(120, 95, 60, 255))  # 도마
    d.ellipse([(28, 5), (40, 14)], fill=(60, 55, 50, 255), outline=(30, 25, 20, 255))     # 냄비
    d.rectangle([(48, 6), (60, 14)], fill=(220, 60, 60, 255), outline=(140, 30, 30, 255))  # 빨간 도마
    d.ellipse([(68, 5), (84, 16)], fill=(120, 75, 45, 255), outline=(60, 35, 20, 255))   # 갈색 솥
    # 짧은 측면
    d.rectangle([(2, 24), (93, 31)], fill=(95, 70, 45, 255))
    d.line([(2, 24), (93, 24)], fill=(50, 35, 20, 255))
    save(img, "counter_topdown.png")


def barrel():
    """술통 장식 (16x20)."""
    img = Image.new("RGBA", (16, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 통 본체
    d.ellipse([(2, 0), (13, 6)], fill=(140, 90, 50, 255), outline=(70, 45, 25, 255))
    d.rectangle([(2, 3), (13, 16)], fill=(140, 90, 50, 255))
    d.ellipse([(2, 14), (13, 19)], fill=(95, 60, 35, 255), outline=(70, 45, 25, 255))
    # 통 띠 (금속)
    d.rectangle([(1, 7), (14, 9)], fill=(80, 70, 60, 255), outline=(40, 35, 30, 255))
    d.rectangle([(1, 12), (14, 14)], fill=(80, 70, 60, 255), outline=(40, 35, 30, 255))
    save(img, "barrel.png")


def wall_decor_painting():
    """벽에 거는 그림 액자 (16x14)."""
    img = Image.new("RGBA", (16, 14), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 액자
    d.rectangle([(0, 0), (15, 13)], fill=(140, 90, 50, 255), outline=(70, 45, 25, 255))
    # 그림 영역
    d.rectangle([(2, 2), (13, 11)], fill=(150, 200, 200, 255))
    # 풍경 (간단한 산+태양)
    d.polygon([(2, 11), (5, 6), (8, 9), (11, 5), (13, 11)], fill=(80, 130, 80, 255))
    d.ellipse([(9, 3), (12, 6)], fill=(255, 220, 100, 255))
    save(img, "wall_decor_painting.png")


def door_frame():
    """입구 문 (탑다운 식당 입구, 32x24)."""
    img = Image.new("RGBA", (32, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 문틀 (벽이 끊긴 부분)
    d.rectangle([(0, 0), (31, 18)], fill=(110, 75, 50, 255), outline=(50, 35, 25, 255))
    # 문 자체 (열린 상태로 표현)
    d.rectangle([(4, 2), (27, 16)], fill=(70, 50, 35, 255), outline=(40, 25, 15, 255))
    # 카펫/매트
    d.rectangle([(4, 18), (27, 23)], fill=(180, 60, 60, 255), outline=(120, 30, 30, 255))
    # 매트 줄무늬
    for x in [10, 16, 22]:
        d.line([(x, 18), (x, 23)], fill=(140, 40, 40, 255))
    save(img, "door_frame.png")


if __name__ == "__main__":
    print(f"Generating Travellers Rest-style placeholder assets to: {OUT}")
    floor_wood()
    wall_horizontal()
    bench_long()
    table_long()
    table_food_plate()
    table_mug()
    customer_side_seated()
    customer_side_walking()
    chef_side()
    counter_topdown()
    barrel()
    wall_decor_painting()
    door_frame()
    print("Done.")
