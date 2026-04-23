"""
V11 4분면 레이아웃용 추가 PIL placeholder 생성.
세로 방향 테이블 + 좌/우 벤치 + facing-left/right 손님 색상 구분.
"""
from PIL import Image, ImageDraw

OUT = "."

def save(img, name):
    img.save(f"{OUT}/{name}.png")
    print(f"saved {name}.png ({img.size})")

# 세로 테이블 (50x80, 갈색 나무)
img = Image.new("RGBA", (50, 80), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((2, 4, 47, 75), fill=(120, 80, 50, 255), outline=(70, 45, 25, 255))
d.rectangle((6, 8, 43, 70), fill=(140, 100, 60, 255))  # 윗면 하이라이트
# 나뭇결 라인 4줄
for y in range(14, 70, 14):
    d.line((6, y, 43, y), fill=(95, 65, 35, 255), width=1)
save(img, "table_vertical")

# 세로 좌측 벤치 (14x70, 진한 갈색)
img = Image.new("RGBA", (14, 70), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((1, 2, 12, 67), fill=(85, 55, 30, 255), outline=(50, 30, 15, 255))
d.rectangle((3, 4, 10, 65), fill=(100, 70, 40, 255))
save(img, "bench_vertical_l")

# 세로 우측 벤치 (14x70, 동일)
save(img, "bench_vertical_r")

# facing-right 손님 (16x22, 좌측 벤치에 앉음 = 테이블 쪽인 우측 향함)
# 머리는 우측 약간 치우침으로 방향감 표현
img = Image.new("RGBA", (16, 22), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
# 다리 (의자 가려짐 영역)
d.rectangle((5, 16, 11, 22), fill=(40, 60, 100, 255))
# 몸통
d.rectangle((4, 8, 12, 17), fill=(220, 120, 80, 255))
# 머리 (우측으로 1px 치우침)
d.ellipse((4, 0, 13, 9), fill=(255, 220, 180, 255))
# 코/방향 표식 (우측)
d.point((12, 4), fill=(0, 0, 0, 255))
d.point((11, 4), fill=(0, 0, 0, 255))
save(img, "customer_facing_right")

# facing-left 손님 (16x22, 우측 벤치에 앉음 = 테이블 쪽인 좌측 향함)
img = Image.new("RGBA", (16, 22), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((5, 16, 11, 22), fill=(40, 60, 100, 255))
d.rectangle((4, 8, 12, 17), fill=(80, 180, 120, 255))  # 색상 구분 (초록)
d.ellipse((3, 0, 12, 9), fill=(255, 220, 180, 255))
# 코/방향 표식 (좌측)
d.point((3, 4), fill=(0, 0, 0, 255))
d.point((4, 4), fill=(0, 0, 0, 255))
save(img, "customer_facing_left")

# 카운터 (좌측 주방용, 세로) - 24x120
img = Image.new("RGBA", (24, 120), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rectangle((1, 2, 22, 117), fill=(110, 75, 45, 255), outline=(60, 40, 20, 255))
d.rectangle((3, 4, 20, 115), fill=(135, 95, 55, 255))
# 카운터 위 접시 표시
d.ellipse((6, 20, 18, 32), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
d.ellipse((6, 60, 18, 72), fill=(230, 220, 200, 255), outline=(150, 140, 120, 255))
save(img, "counter_vertical")

print("done")
