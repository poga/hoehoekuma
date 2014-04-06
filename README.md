# hoehoekumamisu

## convert sprite sheet with imagemagick

```
1. convert -crop 24x32 $SPRITESHEET.png$ sprites/charX_%d.png

2. 去除多餘的tile, 將切開的tile按照d1, d2, d3, d4(其實是2), r1, r2, r3, r4(2), u1, u2, u3, u4(2), l1, l2, l3, l4(2)排序
   (考慮直接將原始 template 就做成這樣，雖然會浪費格子，但是考量 jaws 限制這樣手續更單純，反正也沒人說不行向左走時跟向右走時一定看起來要一樣，可能有人會想畫不一樣的) 

3. 如果有 tile 需要水平翻轉:
convert -flop in.png out.put

4. 拼成sprite_sheet (橫向使用 +append，比縱向適合) 
convert +append sprites/charX_*.png sprites/charX_sheet.png
```

