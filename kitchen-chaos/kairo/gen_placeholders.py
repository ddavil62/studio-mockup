"""
@fileoverview 카이로 소프트 스타일 placeholder 픽셀아트 에셋 생성 스크립트.
도형 기반 임시 에셋으로 레이아웃 시각화 → 마음에 들면 PixelLab/SD로 재발주.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.dirname(os.path.abspath(__file__))


def save(img, name):
    path = os.path.join(OUT, name)
    img.save(path)
    print(f"  -> {path}")


def floor_tile():
    """식당 바닥 타일 (사선 격자 패턴, 32x32)."""
    img = Image.new("RGBA", (32, 32), (220, 195, 160, 255))
    d = ImageDraw.Draw(img)
    # 격자 라인
    d.line([(0, 0), (32, 32)], fill=(180, 155, 120, 255))
    d.line([(32, 0), (0, 32)], fill=(180, 155, 120, 255))
    d.rectangle([(0, 0), (31, 31)], outline=(160, 130, 95, 255))
    save(img, "floor_tile.png")


def wall_back():
    """식당 뒷벽 (사선뷰, 64x32)."""
    img = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 벽면
    d.rectangle([(0, 0), (63, 28)], fill=(140, 110, 80, 255))
    # 상단 천장 라인
    d.rectangle([(0, 0), (63, 4)], fill=(95, 70, 50, 255))
    # 벽 패널 라인
    for x in range(8, 64, 16):
        d.line([(x, 4), (x, 28)], fill=(110, 85, 60, 255))
    # 하단 몰딩
    d.line([(0, 28), (63, 28)], fill=(70, 50, 35, 255))
    d.line([(0, 29), (63, 29)], fill=(50, 35, 25, 255))
    save(img, "wall_back.png")


def table_4seat():
    """4인용 테이블 + 의자 4개 (카이로 스타일, 사선뷰, 64x64).

    레이아웃: 위/아래 의자 2개씩, 중앙에 사각 테이블.
    의자는 미리 합성되어 있어 손님은 의자 위에 단순 배치만 하면 됨.
    """
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 위쪽 의자 2개 (등받이가 위로)
    for cx in [16, 40]:
        # 등받이
        d.rectangle([(cx - 6, 8), (cx + 6, 14)], fill=(120, 75, 40, 255))
        d.rectangle([(cx - 6, 8), (cx + 6, 14)], outline=(70, 40, 20, 255))
        # 좌석
        d.rectangle([(cx - 7, 14), (cx + 7, 22)], fill=(150, 95, 55, 255))
        d.rectangle([(cx - 7, 14), (cx + 7, 22)], outline=(70, 40, 20, 255))

    # 아래쪽 의자 2개 (등받이가 아래로)
    for cx in [16, 40]:
        d.rectangle([(cx - 7, 42), (cx + 7, 50)], fill=(150, 95, 55, 255))
        d.rectangle([(cx - 7, 42), (cx + 7, 50)], outline=(70, 40, 20, 255))
        d.rectangle([(cx - 6, 50), (cx + 6, 56)], fill=(120, 75, 40, 255))
        d.rectangle([(cx - 6, 50), (cx + 6, 56)], outline=(70, 40, 20, 255))

    # 중앙 테이블 (사선뷰 - 윗면이 살짝 보임)
    # 테이블 다리 그림자 영역
    d.rectangle([(8, 30), (56, 44)], fill=(60, 40, 25, 200))
    # 테이블 윗면
    d.polygon([(6, 22), (58, 22), (60, 28), (56, 42), (8, 42), (4, 28)], fill=(180, 130, 80, 255))
    d.polygon([(6, 22), (58, 22), (60, 28), (56, 42), (8, 42), (4, 28)], outline=(80, 50, 25, 255))
    # 테이블 윗면 하이라이트
    d.line([(8, 24), (56, 24)], fill=(220, 175, 120, 255))
    save(img, "table_4seat.png")


def customer_seated():
    """앉은 손님 상반신 컷 (카이로 스타일, 24x28).

    핵심: 다리는 그리지 않음. 의자 위에 배치되면 의자 등받이가 자동으로 정합됨.
    """
    img = Image.new("RGBA", (24, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 머리
    d.ellipse([(7, 2), (17, 12)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 머리카락
    d.rectangle([(6, 2), (18, 7)], fill=(80, 50, 30, 255))
    d.ellipse([(6, 1), (18, 7)], fill=(80, 50, 30, 255))
    # 눈
    d.point((10, 7), fill=(20, 20, 20, 255))
    d.point((14, 7), fill=(20, 20, 20, 255))
    # 몸통 (셔츠)
    d.polygon([(6, 12), (18, 12), (20, 26), (4, 26)], fill=(80, 130, 200, 255))
    d.polygon([(6, 12), (18, 12), (20, 26), (4, 26)], outline=(40, 70, 130, 255))
    # 옷 단추/포켓
    d.line([(12, 13), (12, 25)], fill=(40, 70, 130, 255))
    save(img, "customer_seated.png")


def chef_kairo():
    """셰프 (카이로 사선뷰 스타일, 24x36, 풀바디)."""
    img = Image.new("RGBA", (24, 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 셰프 모자
    d.rectangle([(7, 2), (17, 9)], fill=(255, 255, 255, 255), outline=(180, 180, 180, 255))
    d.ellipse([(5, 0), (19, 6)], fill=(255, 255, 255, 255), outline=(180, 180, 180, 255))
    # 머리
    d.ellipse([(7, 8), (17, 16)], fill=(245, 210, 175, 255), outline=(80, 50, 30, 255))
    # 눈
    d.point((10, 12), fill=(20, 20, 20, 255))
    d.point((14, 12), fill=(20, 20, 20, 255))
    # 몸통 (요리복)
    d.polygon([(6, 16), (18, 16), (20, 26), (4, 26)], fill=(255, 255, 255, 255))
    d.polygon([(6, 16), (18, 16), (20, 26), (4, 26)], outline=(160, 160, 160, 255))
    # 앞치마 끈
    d.line([(8, 18), (8, 25)], fill=(180, 180, 180, 255))
    d.line([(16, 18), (16, 25)], fill=(180, 180, 180, 255))
    # 다리 (바지)
    d.rectangle([(6, 26), (11, 32)], fill=(60, 60, 70, 255), outline=(30, 30, 35, 255))
    d.rectangle([(13, 26), (18, 32)], fill=(60, 60, 70, 255), outline=(30, 30, 35, 255))
    # 신발
    d.rectangle([(5, 32), (11, 35)], fill=(30, 30, 35, 255))
    d.rectangle([(13, 32), (19, 35)], fill=(30, 30, 35, 255))
    save(img, "chef_kairo.png")


def kitchen_counter():
    """주방 카운터 (사선뷰, 96x40).

    상단: 카운터 위 (조리대), 하단: 카운터 정면.
    """
    img = Image.new("RGBA", (96, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 조리대 윗면 (스테인리스)
    d.polygon([(4, 4), (92, 4), (94, 12), (90, 28), (6, 28), (2, 12)],
              fill=(200, 200, 210, 255), outline=(120, 120, 130, 255))
    # 조리대 정면 (어두운 캐비닛)
    d.rectangle([(6, 28), (90, 38)], fill=(120, 90, 60, 255), outline=(60, 40, 25, 255))
    # 캐비닛 도어 라인
    for x in [30, 60]:
        d.line([(x, 28), (x, 38)], fill=(60, 40, 25, 255))
    # 윗면 하이라이트
    d.line([(6, 6), (90, 6)], fill=(230, 230, 240, 255))
    # 작은 조리도구 (장식)
    d.rectangle([(20, 8), (28, 14)], fill=(200, 50, 50, 255))  # 빨간 냄비
    d.ellipse([(50, 8), (58, 14)], fill=(80, 80, 90, 255))     # 검은 팬
    d.rectangle([(70, 8), (82, 14)], fill=(220, 180, 100, 255))  # 노란 도마
    save(img, "kitchen_counter.png")


def door():
    """입구 문 (사선뷰, 32x40)."""
    img = Image.new("RGBA", (32, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 문틀
    d.rectangle([(2, 2), (29, 38)], fill=(100, 70, 40, 255), outline=(50, 30, 15, 255))
    # 문 패널
    d.rectangle([(5, 6), (26, 34)], fill=(140, 100, 60, 255), outline=(70, 45, 25, 255))
    # 유리창
    d.rectangle([(8, 10), (23, 22)], fill=(150, 200, 220, 200), outline=(50, 80, 100, 255))
    # 손잡이
    d.ellipse([(20, 24), (24, 28)], fill=(220, 180, 60, 255), outline=(140, 110, 30, 255))
    save(img, "door.png")


def plant():
    """장식 화분 (사선뷰, 24x32)."""
    img = Image.new("RGBA", (24, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 화분
    d.polygon([(6, 22), (18, 22), (20, 30), (4, 30)], fill=(140, 80, 50, 255), outline=(70, 40, 25, 255))
    # 잎사귀 (둥근 덩어리)
    d.ellipse([(2, 4), (14, 18)], fill=(60, 130, 60, 255), outline=(30, 80, 30, 255))
    d.ellipse([(10, 2), (22, 16)], fill=(80, 150, 70, 255), outline=(40, 90, 40, 255))
    d.ellipse([(6, 12), (18, 24)], fill=(70, 140, 65, 255), outline=(35, 85, 35, 255))
    save(img, "plant.png")


if __name__ == "__main__":
    print(f"Generating Kairo-style placeholder assets to: {OUT}")
    floor_tile()
    wall_back()
    table_4seat()
    customer_seated()
    chef_kairo()
    kitchen_counter()
    door()
    plant()
    print("Done.")
