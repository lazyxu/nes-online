# NES
NES     - 任天堂娱乐系统: Self-explanitory。
Dany    - 与Famicom同义(硬件范围)。
Famicom - 与NES同义，但不支持原始的DMC数字音频重放。
FDS     - Famicom磁盘系统: 安装在Famicom顶部，支持3"双面游戏软盘。

## some materials
http://www.it165.net/embed/html/201312/2367.html
[memoryMap](!images/memoryMap.png)
CPU：6502 NMOS 芯片。 
    直接寻址能力为 64KB，数据处理能力为 8位。
    内建一块特殊的音频处理器。 
RAM：NES 本体预留 8KB 的 RAM 空间，但实际的物理 RAM 仅 2KB。 
PPU：NES 特有的图形处理芯片，内建 10KB 显示内存。
    支持垂直/平行镜像、垂直/平行滚屏，最大发色数64色。
    同屏最大发色数 26 色（也有说法是 25 色，去掉了透明色）。
    支持 8x8 tile，最多支持 64 个8x8 或 8x16 精灵。
    显示分辨率 = 256x240。 
VRAM：图形储存器。
    这个储存器在PPU内部. NES中安装了16kbits 的VRAM。
SPR-RAM：子画面储存器，用来储存子画面，共256 bytes。
    虽然他也在PPU内部，但不是VRAM或者ROM的一部分。
PRG-ROM：程序只读储存器，存储程序代码的存储器。
    也可以认为是通过MMC控制的扩展存储器中的代码部分。
PRG-RAM：程序可写存储器，于PRG-ROM同义，不过这个是RAM。
CHR-ROM：角色只读存储器。
    在PPU外部的VRAM数据, 通过MMC在PPU内部与外部交换，或者在启动队列中“读入”VRAM。
VROM：与CHR-ROM同义。
SRAM：存档可写存储器。
    一般用来保存RPG游戏的进度。
WRAM：与SRAM同义。
pAPU：NES 的音频处理器。
    因为是设计在 CPU 内部，所以叫做 pAPU（pseudo Audio Processing Unit）。
    包含 2 个方块波声道，1 个三角波声道，1 个杂音声 道以及 1 个数字声道。 
DMC：δ调制通道。
    APU中处理数字信号的通道. 通常被认为是PCM (Pulse信号调制器)通道。
EX-RAM：扩展存储器。
    在任天堂的MMC5中使用的，允许游戏扩展VRAM的容量。
Mapper：内存映射设备。
    这并非 NES 本体所有，而是包含在许多游戏卡内部，以扩充 NES 的性能。 
SRAM：Save RAM，也叫 Battery-Backed RAM，即电池储存RAM。
    固化在某些游戏卡上的芯片，关机后由电池供电，信息不会丢失。
    多用来保存 RPG 类游戏的档案资料。
    NES 本体为 SRAM 预留了 8KB 的地址空间（实际多数游戏的 SRAM 大小也是 8KB）

NES 包含 3 种内存。 
    1 种是主内存，在 cpu 内部，可被 CPU 直接访问。 
    1 种是显示内存，在 PPU 内部，CPU 只能通过操作 PPU 寄存器间接访问这块内存。 
    1 种是 OAM 内存（精灵属性内存），同样存在于 PPU 内部，CPU 可通过操作 PPU 寄存器或者利用 DMA 间接访问它

SRAM: Sprite RAM 0x100
VRAM: 显存 0x8000
DMA Access: Direct Memory Access，直接内存存取
PRGROM RomBank
Battery RAM
CHR-ROM VromBank
IRQ: Interrupt Request
PPU: PhysicsProcessingUnit 物理运算处理器

## cpu.js
### 寄存器
每个寄存器占一个字节（八个二进制位）
一共有三个一般用途的寄存器（A、X、Y）和两个特殊用途的寄存器（S、P）
#### A（累加寄存器）
操作所有的算术与逻辑运算，是6502汇编中使用最多的一个寄存器。
#### X、Y（变址寄存器）
具有一般功能的8位的寄存器，主要用来支持各种寻址模式
+---------------------+--------------------------+
|      mode           |     assembler format     |
+=====================+==========================+
| Immediate           |          #aa             |
| Absolute            |          aaaa            |
| Zero Page           |          aa              |   Note:
| Implied             |                          |
| Indirect Absolute   |          (aaaa)          |     aa = 2 hex digits
| Absolute Indexed,X  |          aaaa,X          |          as $FF
| Absolute Indexed,Y  |          aaaa,Y          |
| Zero Page Indexed,X |          aa,X            |     aaaa = 4 hex
| Zero Page Indexed,Y |          aa,Y            |          digits as
| Indexed Indirect    |          (aa,X)          |          $FFFF
| Indirect Indexed    |          (aa),Y          |
| Relative            |          aaaa            |     Can also be
| Accumulator         |          A               |     assembler labels
+---------------------+--------------------------+

(Table 2-3. _6502 Software Design_, Scanlon, 1980)
#### S（堆栈指针）
堆栈区域为$0100-$01FF
#### P（标志寄存器）
  7   6   5   4   3   2   1   0
+---+---+---+---+---+---+---+---+
| N | V |   | B | D | I | Z | C |  <-- flag, 0/1 = reset/set
+---+---+---+---+---+---+---+---+

N  =  NEGATIVE. Set if bit 7 of the accumulator is set.

V  =  OVERFLOW. Set if the addition of two like-signed numbers or the
        subtraction of two unlike-signed numbers produces a result
        greater than +127 or less than -128.
        溢出

B  =  BRK COMMAND. Set if an interrupt caused by a BRK, reset if
        caused by an external interrupt.
        break

D  =  DECIMAL MODE. Set if decimal mode active.
        十进制模式
I  =  IRQ DISABLE.  Set if maskable interrupts are disabled.

Z  =  ZERO.  Set if the result of the last operation (load/inc/dec/
        add/sub) was zero.
        0标志

C  =  CARRY. Set if the add produced a carry, or if the subtraction
        produced a borrow.  Also holds bits after a logical shift.
        借贷，用于减法，比较和逻辑移位

### 主内存
NES 主内存布局（cpu内部）查看附录

## ppu.js
### Name Tables
--------------
NES使用马赛克矩阵进行图形显示; 
这样的格子被叫做 Name Table. 马赛克是 8x8像素 [pixels].
完整的 Name Table 有 32*30 个马赛克 (256*240 像素). 

Name Tables 之中的马赛克的资料被保存在 Pattern Table 之中 (continue on).


## 附录
NES 主内存布局（cpu内部）： 
+----------+----------+---------------------------+ 
| 起始地址   | 结束地址  |           说明              
+----------+----------+---------------------------+ 
|  $0000   |  $07FF   | NES 本体所包含的 2KB RAM。   （2 KB） 
+----------+----------+---------------------------+ 
|  $0800   |  $0FFF   | 这 3 个区域都是 $0000 -     （2 KB） 
+----------+----------+ $07FF 的镜像。换句话说，      
|  $1000   |  $17FF   | 对它们的操作（读/写）实际     （2 KB） 
+----------+----------+ 就是对 $0000 - $07FF 的操    
|  $1800   |  $1FFF   | 作。比如：读取 $08AB 的内    （2 KB） 
|          |          | 容实际等于读取 $00AB 的内     
|          |          | 容。而向 $15CC 写数据实际     
|          |          | 等于向 $05CC 写数据。       
|          |          | 这 3 块不是物理的 RAM，       
|          |          | 它们都是镜像（Mirror）！     
+----------+----------+---------------------------+ 
|  $2000   |  $2007   | PPU 寄存器。CPU 通过对这     （8 字节） 
|          |          | 片区域的操作来实现对 PPU       
|          |          | 的控制。                     
+----------+----------+---------------------------+ 
|  $2008   |  $3FFF   | PPU 寄存器的镜像。           （上面 8 字节） 
|          |          | $2008 = $2000，            （的 1024 次镜像） 
|          |          | $2009 = $2001，            （连同上面 8 字节） 
|          |          | ....                       （共 8 KB） 
|          |          | $200F = $2007，             
|          |          | $2010 = $2000，             
|          |          | $2011 = $2001，            
|          |          | ....                       
+----------+----------+---------------------------+ 
|  $4000   |  $4013   | pAPU 寄存器。CPU 通过对这    （20 字节） 
|          |          | 片区域的操作来实现对 pAPU   
|          |          | 的控制。                   
+----------+----------+---------------------------+ 
|  $4014   |  $4014   | OAM DMA 寄存器。            （1 字节） 
|          |          | 通过操作这个字节，可将     
|          |          | OAM（精灵属性内存）的内容   
|          |          | 传送到指定的主内存中。  
+----------+----------+---------------------------+ 
|  $4015   |  $4015   | pAPU 状态寄存器。           （1 字节） 
|          |          | 各声道的状态，etc....       
+----------+----------+---------------------------+ 
|  $4016   |  $4017   | 输入设备状态寄存器。          （2 字节） 
|          |          | 游戏机的输入设备（例如手柄  
|          |          | 就通过这两个寄存器访问。  
+----------+----------+---------------------------+ 
|  $4018   |  $401F   | 未用？？（未知）             （8 字节） 
+----------+----------+---------------------------+ 
|  $4020   |  $5FFF   | 扩展 ROM。                 （8 KB - 32 字节） 
|          |          | 某些有特殊处理芯片的游戏   
|          |          | 卡利用了这块空间。        
+----------+----------+---------------------------+ 
|  $6000   |  $7FFF   | SRAM（电池储存 RAM）。      （4 KB） 
|          |          | 注意这块 RAM 不存在于 NES 
|          |          | 本体，而是在某些游戏卡（  
|          |          | 如 RPG 游戏卡）内部。    
+----------+----------+---------------------------+ 
|  $8000   |  $FFFF   | 32K 程序代码 ROM。          （32 KB） 
|          |          | 存在于游戏卡内部的 ROM，  
|          |          | 内容为游戏程序代码。      
+----------+----------+---------------------------+ 


