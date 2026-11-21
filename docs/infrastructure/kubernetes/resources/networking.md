# Kubernetes Networkinmg

### Medium

- [Kubernetes Networking: eBPF in Action](https://medium.com/@hmquan08011996/kubernetes-networking-ebpf-in-action-f0df2592dade)
- [Container Network Interface (CNI) in Kubernetes: An Introduction](https://itnext.io/container-network-interface-cni-in-kubernetes-an-introduction-6cd453b622bd)


## Youtube

### Introduction

- [Kubernetes Networking Explained](https://www.youtube.com/watch?v=J8jAzqbXxjE)
- [Understanding Kubernetes Networking in 30 Minutes - Ricardo Katz & James Strong](https://www.youtube.com/watch?v=Mj04QOqAaJ8)
- [Kubernetes Service Discovery | Load Balancing | Networking](https://www.youtube.com/watch?v=hiiiGLnPdq4)
- [16. Kubernetes Networking Explained: Pods, Services & DNS](https://www.youtube.com/watch?v=-YzfhBpK3Nc)
- [Container Networking From Scratch - Kristen Jacobs, Oracle](https://www.youtube.com/watch?v=6v_BDHIgOY8)
- [Container Network Interface (CNI) Simplified | Kubernetes Networking | Pod Security Group](https://www.youtube.com/watch?v=kA0C44nTwjU)
- [Day 32/40 - Kubernetes Networking Explained | Container Network Interface (CNI) With @kubesimplify](https://www.youtube.com/watch?v=EkAzMGldC5M)


### CNCF

- [Container Networking From Scratch - Kristen Jacobs, Oracle](https://www.youtube.com/watch?v=6v_BDHIgOY8)
- [Kubernetes Networking 101 - Randy Abernethy, RX-M LLC](https://www.youtube.com/watch?v=cUGXu2tiZMc)
- [Kubernetes Networking Intro and Deep-Dive - Bowei Du & Tim Hockin, Google](https://www.youtube.com/watch?v=tq9ng_Nz9j8)
- [Tutorial: Communication Is Key - Understanding Kubernetes Networking - Jeff Poole, Vivint Smart Home](https://www.youtube.com/watch?v=InZVNuKY5GY)



## Theory

### What is eBPF?
eBPF stands for extended Berkeley Packet Filter. It's a way to run small programs inside the Linux kernel — the core of your operating system. Back in the 1990s, BPF was just for filtering network packets. Now, eBPF does way more, like watching system activity or changing how traffic moves, all without messing up your system.

Think of it as a helper built into Linux. You write a program, load it into the kernel, and it runs when something specific happens — like a network packet arriving. The kernel makes sure your code is safe so it won't crash anything. It's a powerful way to control what's going on under the hood.


