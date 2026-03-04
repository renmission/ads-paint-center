**ADS Paint Center Integrated Management System With SMS Notification**

**A Thesis Presented to the College Faculty of Tanauan Institute, Inc**  
**Tanauan City**

**In Partial Fulfillment**

**of the Requirements for the Degree of Bachelor of Science in Computer Science**

**By:** 

**Bautista, George C.**

**Lacorte, John Lyndon S.**

**JANAUARY 2026**

## **APPROVAL SHEET** {#approval-sheet}

This Thesis entitled “**ACD Therapy Center Integrated Management System With SMS Notification** ”, has been prepared and submitted by **John Lyndon S. Lacorte, George C. Bautista** in partial fulfillment of the requirements for the Degree of Bachelor **of Science in Computer Science** is hereby recommended for acceptance and approval.

## **MR. MICHAEL A. VELASQUEZ**

Adviser

Approved by the Committee on Oral Examination with a grade of 	%.

## **THESIS COMMITTEE**

**MR. BERNARDO M. GONZALES**

Chairman

## **MS. JACINTA O. PRECILLA, MIT	ENGR. MARIA THERESA B. PRENDA, MSCPE**

Member	Member

Accepted and approved in partial fulfillment of the requirements for the Degree of Bachelor of Science in Computer Science

## **NELIA P. MANANGUIT, Ed.D.**

Dean of Studies

## **ACKNOWLEDGEMENT** {#acknowledgement}

The researchers would like to express their deepest appreciation to various persons who played critical roles in the completion of this thesis. Their encouragement, support, and knowledge have been crucial throughout my academic journey.  
**Honorable Congresswoman Maria Theresa “Maitet” V. Collantes and Dr. Nelson “Sonny” Perez Collantes, and Collantes family** for the scholarship granted to be able to finish this course;  
**Mr. Ronald D Ramilo,** the statistician, for his diligence and patience in formulating the statistical treatment;  
To **Dr. Nelia P. Mananguit**, Dean of Studies, for endorsing the developers and allowing them to gather information from the Institution.  
First and foremost, the developers would like to convey their heartfelt gratitude to their adviser **Mr. Michael A. Velasquez** for his constant support and wise counsel. His experience in this matter has been critical in defining the course of the study and pushing the researchers to achieve excellence.  
To**, Mr. Bernardo M. Gonzales Mr. Michael A. Velasquez** and **Engr. Maria Theresa B. Prenda,** whose experience in computer science gave a fresh viewpoint and improved the depth of this study. Their mentoring has been a guiding force for the researchers, and they are thankful for the time and effort they have put into my academic development.

To the **co-developers**, whose participation and devotion enriched the process of bringing this project to life. The knowledge, ideas, and shared enthusiasm for the topic all contributed greatly to the breadth and quality of the work.  
To their **family** for their constant support and encouragement during the process of finishing this thesis. Their love, understanding, and patience have been the pillars that have kept them going during the difficult times.  
Above all, to **God** for the divine guidance that has provided them with strength and inspiration. Faith offered the clarity and resilience required to overcome hurdles during times of uncertainty.

***J.A.L.G***  
***R.L.P***

## **DEDICATION** {#dedication}

*We dedicate this thesis to our families and loved ones,*

*who have provided us with unwavering support, endless encouragement, and love.*

*Their belief in us has been the driving force behind our success.*

*To our professors and mentors,*

*whose guidance, wisdom, and expertise have been invaluable.*

*We are grateful for their patience and unwavering dedication to our academic pursuits.*

*To our colleagues and classmates,*

*who have been there for us through thick and thin, encouraging us every step of the way.*

*Their support and friendship have made this journey worthwhile.*

*Finally, To **Almighty God**,*

*our Creator, and Guide, who has blessed us with the gift of life.*

*Your grace and mercy have been our constant source of strength and inspiration throughout this journey.*  
*We are grateful for your guidance, wisdom, and love, which have sustained us in moments of doubt and uncertainty**.***

***J.A.L.G***  
***R.L.P***

## **TABLE OF CONTENTS** {#table-of-contents}

**TITLE	PAGE**

**Title Page**	**i**

[Approval Sheet	ii](#approval-sheet)

[Acknowledgement	ii](#acknowledgement)

[Dedication	v](#dedication)

[Table of Contents	vi](#table-of-contents)

List of Figures	viii

List of Table	ix

[Executive summary	x](#executive-summary)

[**CHAPTER I \- INTRODUCTION**	1](#chapter-1)

[Project Context	3](#project-context)

[Purpose and Description	6](#purpose-and-description)

Objectives of the Study	7

[Significance of the Study	8](#significance-of-the-study)

Scope and Limitation of the Study	10

[Conceptual Framework	11](#conceptual-framework)

[Definition of Terms	13](#definition-of-terms)

**CHAPTER II \- RELATED STUDIES AND LITERATURE**

Technical Background	15

Related Literature	16

Related System	17

| CHAPTER III \- DESIGN AND METHODOLOGY |  |
| :---- | ----- |
| Methods of the Study | 20 |
| Software Development Life Cycle | 23 |
| System Development Tools | 24 |
| Functional Requirements | 25 |
| System Design | 28 |
| System Architecture | 30 |
| Database Schema | 32 |
| Context Flow Diagram | 34 |
| System Testing | 31 |
| System Evaluation | 35 |
| Team Responsibilities | 36 |
| System Schedule and Timeline | 37 |
| **CHAPTER IV \- RESULT AND DISCUSSION** |  |
| Technical Description | 38 |
| System Evaluation Results | 49 |

**CHAPTER V \-	SUMMARY	OF	FINDINGS,	CONCLUSIONS	AND RECOMMENDATIONS**  
Summary of findings	53

Conclusions	54

Recommendation	55

BIBLIOGRAPHY APPENDICES

1. USER’S MANUAL

2. RELEVANT SOURCE CODE

3. EVALUATION TOOL

4. GRAMMARIAN’S CERTIFICATION

5. STATISTICIAN’S CERTIFICATE

6. CURRICULUM VITAE

| LIST OF FIGURES |  |  |
| :---- | :---- | ----- |
| **Figure Number** | **Figure Name** | **Figure Page** |
| 1 | Conceptual Framework | 10 |
| 2 | Agile Model | 25 |
| 3 | System Design | 28 |
| 4 | System Architecture | 30 |
| 5 | Data Schema | 32 |
| 6 | Context Flow Diagram | 34 |
| 7 | Log-in Page | 38 |
| 7.1 | Admin Dashboard | 39 |
| 7.2 | Employee Section | 40 |
| 7.3 | Add Employe | 41 |
| 7.4 | Resigned Employee | 42 |
| 7.5 | View Payroll | 43 |
| 7.6 | Create Payroll | 44 |
| 7.7 | Create Pay slip | 45 |
| 7.8 | Pay slip | 46 |
| 7.9 | Pos | 47 |
| 7.10 | Menu | 48 |
| 7.11 | Add Meni | 49 |

| LIST OF TABLES |  |  |
| ----- | ----- | :---- |
| **Table Number** | **Table Name** | **Table** |
| **Page** |  |  |
| 25 | Hardware Specification in Using the System | 1 |
| 26 | Software Specification in Using the System | 2 |
| 27 | Software Requirements for Developing the System | 3 |
| 27 | Hardware Requirements for Developing the System | 4 |
| 32 | Likert Scale | 5 |
| 33 | System Evaluation | 6 |
| 34 | Project Team and their Responsibilities | 7 |
| 45 | Schedule and Timeline | 8 |
| 49 | System’s Functionality | 9 |
| 50 | Reliability | 10 |
| 51 | Usability | 11 |
| 52 | Maintainability | 12 |

## **EXECUTIVE SUMMARY** {#executive-summary}

**TITLE	:	ADS PAINT CENTER INTEGRATED MANAGEMENT SYSTEM WITH SMS NOTIFICATION**

**AUTHORS	:          LACORTE JOHN LYNDON S.**  
**:          BAUTISTA GEORGE C.** 

**TYPE OF DOCUMENT	:	Undergraduate Thesis TOTAL NUMBER OF PAGES	:**

**NAME OF INSTITUTION	:	TANAUAN INSTITUTE, INC. YEAR COMPLETED	:**		**2025**  
**ADVISER	:	MS. JACINTA O. PRECILLA**

This study entitled “ADS Paint Center Integrated Management System with SMS Notification” in Sto. Tomas, Batangas is a locally hosted information system designed to streamline and automate the core business operations of ADS Paint Center. The system integrates essential functionalities such as customer registration, sales and order processing, inventory management, billing and payment recording, automated SMS notifications, and report generation into a single, cohesive platform that supports efficient daily operations.

The motivation for developing the system arises from the challenges faced by ADS Paint Center due to manual and semi-manual business processes, including inaccurate inventory tracking, delays in sales recording, difficulty in monitoring customer transactions, and inefficiencies in billing and reporting. These challenges often result in stock discrepancies, delayed service, and increased risk of human error. To address these issues, the system was developed using PHP and MySQL and deployed through a local server environment (XAMPP), enabling reliable data processing and secure information management without dependence on continuous internet connectivity. The integrated SMS notification feature is designed to send transaction-related updates and order notifications to customers, improving communication and enhancing customer service. The inventory and billing modules ensure accurate stock monitoring and financial documentation, while digital records allow fast retrieval and organized transaction tracking.

Evaluation results indicate that the system demonstrates strong performance in terms of functionality, usability, reliability, and maintainability. Store personnel confirmed that the system improved workflow efficiency, reduced human error, enhanced inventory accuracy, and supported better customer service. Identified limitations include the lack of full mobile support and the absence of integration with external suppliers or online payment platforms. Future improvements may include mobile accessibility, cloud-based integration, and expansion to support multi-branch operations.

This study contributes to the field of business process automation by demonstrating how a localized, integrated management system can significantly enhance operational efficiency, inventory control, and customer service in small- to medium-scale retail enterprises. The ADS Paint Center Integrated Management System with SMS Notification serves as a practical model for technology-driven solutions that address the operational needs of retail and paint supply businesses.

## **CHAPTER 1**  {#chapter-1}

                                                                                   **INTRODUCTION**

ADS Paint Center is a retail business located in Sto. Tomas, Batangas, engaged in the sale of paints, coatings, and related construction and finishing supplies. The store serves individual customers, contractors, and small construction businesses that require timely product availability, accurate pricing, and efficient transaction processing. As customer demand and product variety continue to grow, the need for an organized and reliable system to manage sales transactions, inventory, and customer records becomes increasingly important to sustain efficient business operations.

At present, several operational processes at ADS Paint Center are handled through manual and semi-manual methods such as handwritten records, basic spreadsheets, and verbal coordination. These practices make it difficult to monitor inventory levels accurately, track customer transactions, and generate timely sales and inventory reports. Manual inventory tracking often leads to stock discrepancies, overstocking, or unexpected shortages, which may result in delayed service and reduced customer satisfaction. In addition, monitoring daily sales and billing records becomes time-consuming and prone to human error, affecting the accuracy of financial documentation.

Another challenge faced by the store is the limited communication with customers regarding order status and transaction updates. Without an automated notification system, customers may experience delays in receiving information about order availability or completion, while staff must exert additional effort to provide updates manually. These inefficiencies increase workload and limit the store’s ability to deliver fast and reliable service.

To address these challenges, this study proposes the ADS Paint Center Integrated Management System with SMS Notification. The system is designed to automate and integrate core business functions such as customer registration, sales processing, inventory management, billing, reporting, and SMS-based customer notifications into a single platform. By implementing a locally hosted system, the store can achieve accurate data management, improved transaction processing, reduced human error, and enhanced customer communication. Ultimately, the proposed system aims to improve operational efficiency, inventory control, and overall service quality at ADS Paint Center.

## **Project Context** {#project-context}

The ADS Paint Center Integrated Management System with SMS Notification is a web-based, locally hosted system developed to automate and integrate the core business operations of ADS Paint Center in Sto. Tomas, Batangas. The system serves as a centralized platform for managing customer records, sales transactions, billing, inventory monitoring, and report generation. By utilizing a structured database and role-based user access, the system ensures accurate data processing, secure record management, and efficient workflow within the store.

A key feature of the system is its inventory and sales integration, which allows real-time stock updates after every transaction, helping prevent stock discrepancies and shortages. In addition, the system includes an SMS notification feature that sends transaction-related updates such as order confirmations and order-ready alerts to customers, improving communication and reducing manual follow-ups. Overall, the system enhances operational efficiency, data accuracy, inventory control, and customer service, supporting more effective business management at ADS Paint Center.

## 

## 

## 

## **Purpose and Description** {#purpose-and-description}

        The purpose of the ADS Paint Center Integrated Management System with SMS Notification is to provide an efficient and reliable digital solution that automates and organizes the daily business operations of ADS Paint Center. The system aims to address the limitations of manual record-keeping, such as inventory inaccuracies, delayed sales recording, and billing errors, by centralizing customer information, sales transactions, inventory data, and financial records into a single platform. Through automation, the system supports accurate data management, reduces human error, and improves overall operational efficiency.

The system is designed as a web-based, locally hosted application that integrates sales processing, inventory monitoring, billing, reporting, and SMS-based customer notifications. The SMS feature is intended to send transaction-related updates such as order confirmations and order-ready notifications to customers, enhancing communication and customer satisfaction. Overall, the system serves as a comprehensive management tool that improves inventory control, streamlines business processes, and supports effective decision-making at ADS Paint Center.

## 

## 

## 

## 

## 

## 

## **Objectives of the Study General Objective**

The general objective of this study is to design and develop an integrated management system that improves the efficiency, accuracy, and organization of business operations at ADS Paint Center.

## **Specific Objectives**

* 	To develop a customer registration and management module that securely stores and organizes customer information and transaction history.

* 	To implement a sales and billing module that records transactions accurately and generates reliable billing statements.

* 	To develop an inventory management module that monitors stock levels in real time and minimizes inventory discrepancies.

* 	To integrate an SMS notification feature that sends transaction-related updates such as order confirmations and order-ready alerts to customers.

* 	To create a reporting module that generates sales and inventory reports to support business monitoring and decision-making.

* 	To implement user access control to ensure system security and proper use of system functionalities.


##                   **Significance of the Study** {#significance-of-the-study}

	The ADS Paint Center Integrated Management System with SMS Notification is significant to various stakeholders involved in the daily operations of the business. The system contributes to improved operational efficiency, accurate inventory control, organized sales transactions, and enhanced customer communication.

	**ADS Paint Center Management and Staff**: The system helps management and staff efficiently manage customer records, sales transactions, inventory levels, and billing information by reducing manual workload and improving data accuracy.

	**Customers**: The system benefits customers by sending SMS notifications for order confirmations and order-ready updates, helping them stay informed and improving overall service experience.

	**Business Owners**: The system supports business owners by providing accurate sales and inventory reports that assist in monitoring business performance and making informed decisions.

	**Future Researchers and Developers**: The study serves as a reference for future researchers and developers in creating integrated management systems for retail businesses and similar enterprises.

## **Conceptual Framework** {#conceptual-framework}

|    INPUT      • Customer Information         • Product Details              • Inventory Data               • Sales Transactions           • Payment Records              • User Credentials          |   PROCESS     • Customer Registration        • Sales & Billing Computation  • Inventory Updates            • Report Generation            • SMS Notification Processing  • User Access Control         | OUTPUT     • Accurate Sales Records       • Updated Inventory Reports    • Billing Statements           • Transaction Summaries       • SMS Notifications Sent       • Improved Operational Efficiency |
| :---: | :---: | :---: |

**Figure 1\. Conceptual Framework**

Figure 1\. Conceptual Framework

The conceptual framework of the study is anchored on the Input–Process–Output (IPO) model, which explains how the proposed ADS Paint Center Integrated Management System with SMS Notification transforms business data into meaningful outputs to enhance operational efficiency and customer service.

The Input consists of essential business and operational data such as customer information, product details, inventory levels, sales transactions, payment records, and employee credentials. These inputs serve as the primary data sources required for managing inventory, tracking sales, processing requests, and notifying relevant personnel.

The Process involves the system’s core functionalities, including customer registration and profile management, product and inventory tracking, sales transaction processing, request approval and status updates, user access control, billing and records management, and automated SMS notification handling. These processes ensure accurate data handling, secure access, real-time updates, and prompt communication between staff and customers.

The Output includes updated and organized inventory records, approved or rejected product requests with reasons, accurate sales and billing reports, automated SMS notifications sent to customers and administrators, and generated operational reports. These outputs lead to improved business operations, minimized stock discrepancies, enhanced communication, and timely fulfillment of customer requests.

Overall, the conceptual framework illustrates how the integration of an automated management system with SMS notification facilitates efficient business operations, informed decision-making, and improved coordination among administrators, staff, and customers at ADS Paint Center.

## 

## 

## 

## 

## 

## 

## 

## 

## **Definition of Terms** {#definition-of-terms}

The following terms are defined both conceptually and operationally to provide a clearer understanding of the system and the study.  
**ADS Paint Center Integrated Management System**  
A computerized information system developed to manage customer records, product inventory, sales transactions, billing, request approvals, and communication within ADS Paint Center.  
**Admin Panel**  
A secured section of the system accessible only to authorized administrators, where user accounts, product inventory, sales records, requests, billing data, and system settings are managed.  
**Customer Information**  
The process of recording and maintaining details about clients, including personal data, purchase history, contact information, and account credentials within the system.  
**Automated SMS Notification**  
A system feature that sends short message service (SMS) alerts to customers and administrators regarding product requests, approvals, rejections, inventory updates, and other important notifications.  
**Backend**  
The server-side component of the system responsible for processing data, executing business logic, managing security, and storing information in the database.  
**Billing Management**  
A system module used to record customer purchases, payments, invoices, and financial transactions to support organized documentation and reporting.  
**Product Inventory**  
A digital record containing information about all paint products, supplies, and materials, including stock levels, pricing, and availability.  
**Dashboard**  
The main interface that displays summarized information such as pending requests, low stock alerts, sales data, notifications, and system activities for quick monitoring.  
**Database**  
A structured collection of data where customer records, inventory information, sales transactions, requests, billing, and user accounts are securely stored and managed.  
**Frontend**  
The visible part of the system that users interact with, including forms, buttons, menus, and page layouts.  
**Integrated Management System**  
A system that combines multiple functions such as customer management, inventory tracking, request processing, reporting, billing, and communication into a single platform.  
**Request Tracking**  
A system function that allows staff and administrators to document, monitor, and update the status of customer product requests in real time.  
**Role-Based Access Control**  
A security mechanism that restricts system access based on user roles such as administrator or staff to protect sensitive business and customer data.  
**Sales Transaction**  
The process of recording customer purchases, updating inventory, generating receipts, and documenting payments using the system.  
**SMS Module**  
A supporting system component responsible for sending automated text message notifications to customers and administrators regarding requests, inventory updates, approvals, and rejections.  
**Staff/User**  
An authorized system user responsible for managing inventory, processing sales, handling requests, and updating records according to assigned roles.  
**User Account**  
A registered system profile that allows authorized personnel to access system features based on assigned roles and permissions.  
**User Interface (UI)**  
The visual layout and design through which users interact with the system, including screens, forms, menus, and navigation elements.

## **CHAPTER II**

**Review of Related Literature and Studies / Technical Background**

This chapter presents the review of related literature and studies relevant to the development of the ADS Paint Center Integrated Management System with SMS Notification. The review focuses on existing concepts, systems, and technologies related to inventory and sales management, request tracking, billing, and the use of SMS modules for notifications. The purpose of this chapter is to establish the theoretical and technological foundation of the proposed system and to highlight gaps that the study aims to address.

**2.1 Retail and Inventory Management Systems**

Retail centers, such as paint and hardware suppliers, require organized and accurate management of product inventory, customer requests, and sales transactions. Manual record-keeping methods are prone to errors, misplacement of records, and inefficiencies, which may lead to stock discrepancies, delayed orders, and poor customer service. According to studies on retail information systems, automated inventory and management systems improve operational efficiency by centralizing data, streamlining workflows, and reducing manual workloads.

**2.2 Customer and Request Management Systems**

Customer and request management systems are widely used in retail and service industries to handle personal data, transaction histories, and product or service requests. These systems typically include modules for customer registration, request tracking, order processing, and billing. Research shows that digital request management systems help minimize order errors, prevent duplication of requests, and improve response time for both staff and customers.

For retail centers, request management systems are essential in maintaining accurate records of orders, approvals, and stock availability. The proposed ADS Paint Center Integrated Management System incorporates automated request tracking and approval management to support staff in handling multiple customer requests efficiently while maintaining organized records of transactions and inventory levels.

**2.3 Sales Transaction and Notification Systems**

Sales transaction systems are designed to automate the recording, updating, and monitoring of customer purchases. In retail environments, errors in sales or delayed order processing can lead to dissatisfied customers and lost revenue. Studies indicate that automated notification systems significantly improve communication, minimize delays, and enhance operational efficiency.

Modern notification systems often integrate SMS modules to inform customers and staff about order status, request approvals, low stock alerts, or other important updates. Among available methods, SMS is considered highly effective due to its accessibility and high open rate, even on basic mobile devices.

In the proposed system, SMS notifications are focused on order updates, request approvals, and stock alerts, ensuring that customers and administrators receive timely and relevant information without unnecessary overload.

**2.4 SMS Technology in Business Information Systems**

Short Message Service (SMS) technology is widely used in business information systems for delivering time-sensitive notifications. SMS does not require internet connectivity and can be received on almost all mobile devices, making it a reliable communication method.

In retail and service management systems, SMS notifications are commonly used for confirming orders, alerting customers of low stock, sending approvals, or notifying staff of pending actions. The proposed system utilizes an SMS module to automate notifications, ensuring that messages are sent based on request approvals, sales transactions, and inventory status. By using an SMS module, the system reduces manual communication, enhances customer engagement, and ensures timely updates for staff and customers.

**2.5 Integrated Management Systems**

An integrated management system combines multiple functional modules into a single unified platform. In retail operations, integration allows customer information, product inventory, sales transactions, request processing, and billing functions to work together seamlessly. Literature on integrated systems emphasizes improved data accuracy, minimized redundancy, and better decision-making through centralized information.

The ADS Paint Center Integrated Management System is designed to integrate customer management, inventory tracking, request processing, billing, and SMS notifications. This integration supports efficient operations, secure data handling, and improved communication between the paint center, its staff, and customers.

**2.6 Related Studies**

Several studies on retail and service management systems highlight the benefits of automation and integrated platforms:

**2.6.1 Foreign Studies**

1\.	Huang and Lin (2018) developed a retail POS-integrated inventory management system that automatically updates stock levels and sales records. The study emphasized real-time inventory monitoring, reduced errors, and improved customer satisfaction.

2\.	Singh and Verma (2020) implemented an SMS notification system for a retail company, informing customers about order status and product availability. This system significantly improved communication efficiency and reduced missed orders.

**2.6.2 Local Studies**

1\.	Reyes (2019) developed an inventory monitoring system for a hardware store with SMS alerts for low-stock products. The system reduced stock discrepancies and supported timely restocking.

2\.	Delos Santos (2021) implemented an integrated business system for a local bakery combining order management, inventory control, and billing. The study reported improved operational efficiency, accurate record-keeping, and enhanced customer satisfaction.

**2.7 Synthesis of the Review**

Based on the reviewed literature and related systems, it is evident that **integrated management systems with automated SMS notifications** are essential for modern retail operations. Existing studies confirm that SMS technology improves communication efficiency, ensures timely updates, and reduces operational errors.

However, many existing systems are either too generic or not tailored specifically for small-to-medium retail centers handling inventory, requests, and customer communication simultaneously.

The **ADS Paint Center Integrated Management System with SMS Notification** addresses these gaps by offering a customized solution focused on:

•	Efficient customer and request management

•	Real-time inventory tracking and low-stock alerts

•	Automated SMS notifications for approvals, sales updates, and stock alerts

•	Centralized reporting and billing

This approach ensures improved operational efficiency, accurate record-keeping, better communication with customers and staff, and enhanced overall service delivery.

## **CHAPTER III**

**DESIGN AND METHODOLOGY**

This chapter discusses the research methodology, system development approach, tools, techniques, and procedures used in the development of the **ADS Paint Center Integrated Management System with SMS Notification**. It explains how the system was planned, designed, developed, tested, and implemented to address the operational needs of the paint center, particularly in managing customer data, inventory, sales transactions, product requests, and SMS notifications.

**3.1 Research Design**  
The study utilized a **descriptive and developmental research design**. The descriptive approach was employed to analyze the existing processes at ADS Paint Center, including customer management, inventory tracking, sales transactions, and product request handling. The developmental approach focused on designing and developing an integrated management system that automates these processes, improves operational efficiency, and reduces manual errors.  
This methodology is appropriate as the study aims not only to describe current operational problems but also to develop a functional system as a solution.

**3.2 System Development Methodology**  
The system was developed using the **Waterfall Model**, a sequential software development methodology that follows structured and well-defined phases. The Waterfall Model was selected due to its clarity, simplicity, and suitability for academic system development projects.  
The phases applied in this study include:  
1\.	**Analysis** – Gathering system requirements through interviews, observation of the paint center’s operations, and reviewing existing documentation.  
2\.	**System Design** – Creating system architecture, database design, and process flows based on identified requirements.  
3\.	**System Development** – Coding and integrating system modules, including inventory management, request processing, billing, and the SMS module.  
4\.	**Testing** – Conducting functionality, integration, and usability tests to ensure system reliability and accuracy.  
5\.	**Implementation and Maintenance** – Deploying the system and addressing minor issues for continuous improvement.

**3.3 System Architecture**  
The **ADS Paint Center Integrated Management System** follows a **client-server architecture**. The system consists of a centralized database, a web-based application interface for administrators and staff, and an SMS module for sending notifications.  
Administrators and staff access the system through authenticated user accounts. Data entered into the system—such as product requests, inventory updates, and sales transactions—triggers the SMS module to automatically send notifications to customers or administrators when necessary. SMS notifications are limited to relevant operational alerts, such as order approvals, rejections, and low-stock alerts.

**3.4 System Modules**  
**3.4.1 Customer Management Module**  
This module handles the registration and maintenance of customer information. It stores personal details, contact information, and transaction history in a secure database. Authorized users can efficiently add, update, and retrieve customer data.  
**3.4.2 Inventory Management Module**  
This module manages product stock levels, product details, and pricing information. It allows administrators to update inventory, monitor stock availability, and generate inventory reports to prevent stockouts or overstocking.  
**3.4.3 Request and Sales Management Module**  
This module processes customer product requests and records sales transactions. It ensures accurate tracking of orders, approvals, and billing, reducing errors and improving service efficiency.  
**3.4.4 SMS Notification Module**  
The SMS module sends automated notifications regarding request approvals, rejections, and low-stock alerts. Notifications are delivered to customers or administrators based on system triggers, ensuring timely communication and reducing manual follow-up efforts.  
**3.4.5 User Management Module**  
This module manages system users, roles, and access privileges. Role-based access control ensures that only authorized staff or administrators can access sensitive operational data.

**3.5 Development Tools and Technologies**  
The development of the system utilized the following tools and technologies:  
•	**Programming Language**: Web-based programming languages for system logic and interface development  
•	**Database Management System**: Relational database for storing customer, inventory, sales, and request data  
•	**SMS Module**: Responsible for sending automated notifications  
•	**Web Server**: Hosts the system and manages client-server communication  
•	**Browser-Based Interface**: Allows access to the system using standard web browsers

**3.6 Data Gathering Techniques**  
The data required for system development were collected using the following techniques:  
•	**Interview**: Conducted with the paint center administrator to understand current workflows and operational issues  
•	**Observation**: Analysis of existing manual processes related to inventory, sales, and request handling  
•	**Document Review**: Examination of existing forms, transaction logs, and inventory records used by the paint center

**3.7 System Testing**  
System testing was conducted to ensure that all modules function correctly and meet the specified requirements:  
•	**Functional Testing**: Verifies that each module performs its intended function  
•	**Integration Testing**: Ensures proper interaction between system modules, including the SMS module  
•	**User Acceptance Testing**: Confirms that the system meets the expectations and operational needs of end users

**3.8 Ethical Considerations and Data Security**  
The system was designed with data privacy and security in mind. Customer information and transaction data are protected through user authentication and access control mechanisms. All collected data are used strictly for operational purposes and are handled in compliance with confidentiality standards.

**3.9 System Design Diagrams**  
This section presents conceptual descriptions of the system diagrams used in designing the **ADS Paint Center Integrated Management System with SMS Notification.** These diagrams provide visual representations of the system’s structure, processes, and data flow.  
**3.9.1 System Flowchart**  
The system flowchart illustrates the overall operational flow. It begins with user authentication. Once authenticated, users can access different modules such as customer management, inventory tracking, request processing, and sales. When a product request or transaction occurs, the system triggers the SMS module if notifications are required. All data are stored securely in the database.  
**3.9.2 Use Case Diagram**  
The use case diagram identifies system actors and their interactions. Primary actors include Administrator, Staff, and Customer. Administrators manage inventory, requests, and system users. Staff process sales and handle product requests. Customers receive SMS notifications related to request approvals, rejections, or low-stock alerts.  
**3.9.3 Data Flow Diagram (DFD)**  
The DFD shows how data moves within the system. Customer information, requests, and sales transactions are entered by authorized users and stored in the central database. Request and sales data flow to the SMS module, which sends notifications to customers or administrators.  
**3.9.4 Entity Relationship Diagram (ERD)**  
The ERD defines the database structure. Major entities include **Customer, Product, Request, Sale, and User Account**. Relationships ensure proper linkage between customers, product requests, sales, and system users for efficient data storage and retrieval.

**3.10 Summary**  
This chapter presented the methodology used in developing the **ADS Paint Center Integrated Management System with SMS Notification**. It discussed the research design, system development methodology, system architecture, modules, development tools, data gathering techniques, testing procedures, and system design diagrams. The structured methodology, combined with the integration of SMS notifications for operational alerts, ensures that the developed system effectively addresses the operational needs of ADS Paint Center while maintaining data security and improving overall service efficiency

