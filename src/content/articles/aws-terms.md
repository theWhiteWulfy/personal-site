---
title: "AWS Terms"
excerpt: "A list of terms used in AWS"
path: /articles/aws-terms/
categories: [articles]
tags: [web development, design, open source]
date: 2019-07-19
last_modified_at: 2020-01-06T09:59:14-05:00
comments: true
toc: true
---


There are many terms in AWS that use confusing names for simple things.
Even working with AWS for over a year, I really miss out on some terms. That's why I wrote this article. Typing whatever I remember. I am studying these for my AWS exam, which I will take in a few weeks!

So here are the terms:

## Terms

1. **Access control list (ACL)**: A firewall/security layer on the subnet level
2. **Auto scaling**: Automates the process of adding or removing EC2 instances based on traffic demand for your application
3. **Buckets**: Root-level “folders”
4. **CloudFront**: Content delivery network (CDN) that allows you to store your content at “edge locations” located all around the world, allowing customers to access your content more quickly
5. **CloudTrail**: Allows you to monitor all actions taken by IAM users
6. **CloudWatch**: Service that allows you to monitor various elements of your AWS account
7. **Consolidated billing**: Allows you to view, manage, and pay bills for multiple AWS accounts in one user interface
8. **DNS server**: A database of website domains and their corresponding IP addresses
9. **DynamoDB**: NoSQL database service that does not provide other NoSQL software options
10. **Elastic Compute Cloud (EC2)**: A virtual computer, very similar to a desktop/laptop computer
11. **Elastic Load Balancing (ELB)**: Evenly distributes traffic between EC2 instances that are associated with it
12. **ElastiCache**: Data caching service used to help improve the speed/performance of web applications running on AWS
13. **Elasticity**: The ability of a system to increase and decrease in size
14. **Fault tolerance**: Property that enables a system to continue operating properly in the event of the failure of one or more components
15. **Firewall**: A type of software that either allows or blocks certain kinds of internet traffic to pass through it
16. **Folder**: Any “subfolder” created in a bucket
17. **High availability**: Refers to systems that are durable and likely to operate continuously without failure for a long time
18. **IAM users**: Individuals who have been granted access to an AWS account
19. **Identity and Access Management (IAM)**: Service where AWS user accounts and their access to various AWS services are managed
20. **Lambda**: Serverless computing that will replace EC2 instances, for the most part
21. **Object availability**: Percent over a one-year time period that a file stored in S3 will be accessible
22. **Object durability**: Percent over a one-year time period that a file stored in S3 will not be lost
23. **Object lifecycle**: Set rules to automatically transfer objects between storage classes at defined time intervals
24. **Object sharing**: Ability to make any object publicly available via a URL link
25. **Object versioning**: Automatically keep multiple versions of an object (when enabled)
26. **Organizations**: Allow you or your company access to manage billing and access to multiple AWS accounts in one user interface
27. **Principle of least privilege**: Giving a user only the rights/access to the AWS services and resources they need to do their job and nothing more
28. **Publishers**: Human/alarm/event that gives SNS the message that needs to be sent
29. **Relational Database Service (RDS)**: SQL database service that provides a wide range of SQL database options to select from
30. **RedShift**: Data warehouse database service designed to handle petabytes of data for analysis
31. **Roles**: How different AWS services are granted permission to communicate and share data
32. **Route 53**: Where you configure and manage web domains for websites or applications you host on AWS
33. **Scalability**: The ability of a system to easily increase in size and capacity in a cost-effective way
34. **Security group (SG)**: Firewall/security layer on the server/instance level
35. **Shared responsibility model**: Defines what you and AWS are responsible for when it comes to security and compliance
36. **Simple Notification Service (SNS)**: AWS service that allows you to automate the sending of email or text messaging notifications based on events that happen in your AWS account
37. **Simple Storage Service (S3)**: Online bulk storage service you can access from almost any device
38. **Storage class**: Represents “classification” assigned to each object in S3 (standard, RRS, S3-IA, Glacier)
39. **Subnet**: A subsection of a network and generally includes all the computers in a specific location
40. **Subscriptions**: Endpoints to which a topic sends messages
41. **Topics**: How you label and group different endpoints to which you send messages
42. **Trusted Advisor**: Service that “advises” and helps you optimize aspects of your AWS account
43. **User credentials**: IAM user’s username and password for logging in to AWS
44. **Virtual Private Cloud (VPC)**: A private subsection of AWS you control and in which you can place AWS resources

**Do tell me what I've missed! It will help both me and the community. :-)**
