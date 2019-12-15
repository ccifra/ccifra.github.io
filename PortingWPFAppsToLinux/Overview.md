# A Guide To Running WPF Apps on Linux With .NET Core and Wine

## Overview

With the release of .NET Core 3.0 and it's support for WPF it is now possible to run a WPF app Linux by running the application under Wine.

For those who have not heard of Wine before, it is a compatibiliy layer which allows you to run Windows applications of Linux, and other OSes.
For more information you can read up on Wine at their website: [WineHQ](https://www.winehq.org/)

Wine, in my experience, is mostly used to enable users to run games on Linux, which is great for the WPF use case since WPF uses DirectX for rendering.

Wine is typically used to run applications out of the box. This is a fairly high bar since any missing API or behavioral difference between Wine and Windows can result in a unusable app. If you are willing to test and make the necessary changes to your app you can be successful running your WPF apps on linux.  I have had great success getting several apps including some very large apps running with minimal changes.

## Getting Started

First you need to port your WPF application to .NET Core. There are lots of great documents out there on how to poert a WPF application to .NET Core. Microsoft's [Migration](https://docs.microsoft.com/en-us/dotnet/desktop-wpf/migration/convert-project-from-net-framework) page is a great place to start.

Once your app is working great on Windows you can give it a try on Linux.  It is a lot easier to debug and fix issues on Windows than it is on Linux.  Make sure that you are happy with your app on Windows before trying it on Linux.

### Install Wine on your Linux computer

.NET Core WPF Apps work well with current versions of Wine, but you may run into issues with older versions. I have tested various apps with [Wine 4.21](https://www.winehq.org/news/2019112901).

Follow the instructions on the [Wine Installation](https://wiki.winehq.org/Download) page to install the Wine which is compatible with your distribution.  Once wine is installed you need to set it up. Running winecfg will is an easy way to get wine to setup the configuration directory.

![](LaunchWinecfg.png)

When setting up the configuration directory Wine will prompt you to install Mono. You do not need to install Mono .NET to run .NET Core applications. You can cancel the install of Wine Mono.  Wine Gecko is also not needed.

![](WineMonoPrompt.png)

Once wineconfig is up and running you should also have a .wine directory in your home directory:

![](WineSetup.png)

### Install .NET Core on Wine

I find the easiest way to install .NET Core is to just copy the dotnet directory from your Windows install to the Linux computer.

Copy the entire dotnet folder from Windows:
![](DotNetFromWindows.png)

to the Program Files directory in the Wine configuration location:

![](LinuxInstallofDotNetCore.png)

### Install your app on Linux

You can just copy the Windows build to anywhere on your Linux machine.

### Make sure you have fonts installed

When testing out various applications I often experienced odd crashes when an appropriate font was not available.  For testing purposes the easiest way to get necessary fonts is with [Winetricks](https://wiki.winehq.org/Winetricks).  Install Winetricks and then run it. From there you can install fonts available from a variety of sources.

### Run your app under Wine

Once you app is copied to the Linux machine you can run it under Wine:

```
wine {location name of your app}
```

Here is a picture of the [Modern WPF](https://github.com/Kinnara/ModernWpf) example application running on Linux
![](ModernWPFSampleApp.png)

**Note:** I have only testing 64bit applications.  32bit should work as well but I have no proof of that.

## Calling native code

You can customize your .NET app for Linux and call into native linux code with P/Invokes in your .NET code. The key is to create addition Wine DLLs that then call into linux libraries.

The easiest way I have found to do this is to download and build the Wine source and then follow the patterns of the built-in DLLs.  The Wine [Developer Hints](https://wiki.winehq.org/Developer_Hints#Implementing_a_new_DLL) page has information on how to implement a new DLL.  You can follow these instructions to create a DLL that is specific for your application.

Lets say you have a .so (examplelibrary.so) that has a method like this:

``` cpp

extern "C" int GetSystemInformation(char* systemInformation) {
    // Implementation
}

```

that you want to call into.  To call into it you need to make an equivalent DLL version (winExampleLibrary) that you can then pInvoke to:

``` cpp

LONG WINAPI GetSystemInformation(char* systemInformation) {
    if (!impl_handle) {
        impl_handle = wine_dlopen("examplelibrary.so", RTLD_NOW, NULL, 0);
        if (impl_handle == NULL)
            return -1;
        pGetSystemInformation = wine_dlsym(impl_handle, "GetSystemInformation", NULL, 0);
    }
    if (pGetSystemInformation == NULL)
        return -1; 
    return pGetSystemInformation(systemInformation);
}

```

Then you can pInvoke normally

``` csharp

[DllImport(winExampleLibrary")]
private extern static unsafe int GetSystemInformation(byte* data);

```

## What do you do if the app does not work

I have not been able to get a debugger working with .NET Core apps running under Wine so you will have to rely on logging methods to debug issues that you run into.

### Console.Writeline

You can use Console.WriteLine to log any information you may need to debug issues. I highly recommend adding generous amounts of logging, asserts, and verification to your app.  When catching unexpected excetions be sure to log the exception and call stack from the exception so you can easily determine the location of the error.

I reccommend installing general exception handlers you can you catch unhandled exceptions and log them as well.

Dispatcher has an [UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.windows.threading.dispatcher.unhandledexception?view=netcore-3.0) event you should register for.

AppDomain also has an [UnhandledException](https://docs.microsoft.com/en-us/dotnet/api/system.appdomain.unhandledexception?view=netcore-3.0) event that you should also register for.

### Wine Tracing

Wine is good at letting you know when your application calls unimplemented or partially implemented functionality.  These messages can greatly aid in tracking down issues.

In addition to the standard tracing of Wine you can configure even more event logging, including logging every call into Wine, to help you track down issues.  You can learn more about debug logging [Here](https://wiki.winehq.org/Wine_Developer%27s_Guide/Debug_Logging)

Also the Wine [Debugging Hints](https://wiki.winehq.org/Debugging_Hints) may provide some insights.

## Issues I ran into

### Rendering Issues with different Video Cards

I have experienced render issues depending on what manufacturer of video card I am using.
Nvidia cards do the best with only minor render issues.  Amd cards also do a decent job.  Intel video is basically unusable.  If you experience render issues (artifacts, clipping issues, ...) you will likely have better luck if you switch to software rendering.  You can do this by setting LIBGL_ALWAYS_SOFTWARE to 1.

``` text
export LIBGL_ALWAYS_SOFTWARE=1
```

#### HTTP Listener

#### Culture Enumeration

#### File System Security APIs

## Will WPF apps run on other OSes

WPF runs on DirectX 9 so any build of Wine with a reasonable DirectX support.

## Whats Next

When you run a WPF application on Linux as documented here you end up with an application that is something like this:

![](StockWineNetApp.png)

It would be great to be able to switch to .NET Core for Linux, keep using WPF, and have WPF Apps continue to work for the most part.  Then the appliations would have a boxology like this

![](WineLibBoxology.png)

To do this WPF needs to be updated to compile against [WineLib](https://wiki.winehq.org/Winelib_User%27s_Guide). In theory this should not be too difficult, but I have not tried this at all yet.

Switching to the Linux version of .NET Core would enable debugging and calling into native libraries without having to create a Wine wrapper DLL.
