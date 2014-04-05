# hoehoekumamisu

## convert sprite sheet with imagemagick

```
1. convert -crop 24x32 $SPRITESHEET.png$ sprites/charX_%d.png

2. 去除多餘的tile, 將切開的tile按照down1, down2, down3, up1, up2, up3, right1, right2, right3, left1, left2, left3排序

3. 如果有 tile 需要水平翻轉:
convert -flop in.png out.put

4. 拼成sprite_sheet
convert -append sprites/charX_*.png sprites/charX_sheet.png
```

