# Final Step
The last step is to configure the devices menu inside of GameMaker. This allows you to compile to
native linux code.

## 1.
Click on the Targets menu in the top right corner

![](https://davecode.me/afterstudiosh1.png)

## 2.
Click on Ubuntu

![](https://davecode.me/afterstudiosh2.png)

## 3.
Click the Edit button in the devices column

![](https://davecode.me/afterstudio3.png)

## 4.
Add a new device:
- **Display Name**: Anything you want.
- **Host Name**: The string `localhost`
- **User Name**: Your current login username
- **Password**: Your current login password
- **Install Folder**: This can be anywhere, but to keep everything in the generated data folder, set it to the string `/home/{USERNAME}/.gamemaker/build` with your username.

![](https://davecode.me/afterstudio4.png)

Press \[OK] and you can now use `yyc --linux` to compile for linux. It's slightly slower than just Windows on WINE.
