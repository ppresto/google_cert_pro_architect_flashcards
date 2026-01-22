window.masterData = [
    // --- CATEGORY: COMPUTE & ORCHESTRATION ---
    {
        cat: 'Compute',
        q: 'Scenario: A global fintech startup needs to deploy a containerized payment processing API. The workload is spiky, requires millisecond-level cold starts, and must scale to zero to minimize OpEx. They have no dedicated DevOps team to manage Kubernetes nodes. What is the architecture?',
        a: 'Cloud Run + Eventarc + Cloud SQL Proxy',
        d: '1. **Origin**: External API Request. \n2. **Ingest**: Global External HTTP(S) Load Balancer. \n3. **Process**: Cloud Run (Containerized logic) scales to zero when idle. \n4. **Persistence**: Cloud SQL (PostgreSQL) for transactional integrity. \n5. **Security**: Identity-Aware Proxy (IAP) for internal dashboards; IAM for service-to-service calls.',
        t: 'Heuristic: "Scale to Zero" + "Containers" + "Low Ops" = Cloud Run. If they needed custom kernel modules, the answer would be GKE Standard.',
        l: 'LIMITS: Cloud Run has a max request timeout of 60 mins. Not suitable for long-running background batch jobs (use Cloud Run jobs instead).',
        c: 'CHALLENGE: Managing database connections. High concurrency in Cloud Run can overwhelm Cloud SQL; use a Connection Pooler like pgBouncer.'
    },
    {
        cat: 'Compute',
        q: 'Scenario: A manufacturer needs to run a legacy ERP system that requires a specific Windows Server kernel and a legacy license bound to a physical MAC address. They must migrate to GCP within 30 days without code changes.',
        a: 'Compute Engine (GCE) + Sole-Tenant Nodes',
        d: '1. **Origin**: On-prem VM image. \n2. **Ingest**: Migrate for Compute Engine (Direct migration). \n3. **Process**: Sole-Tenant Nodes provide dedicated physical hardware to satisfy licensing/compliance. \n4. **Persistence**: Regional Persistent Disk for high availability across zones.',
        t: 'Heuristic: "Legacy OS" or "Compliance/Licensing" = Sole-Tenant Nodes on GCE.',
        l: 'LIMITS: Sole-Tenant nodes require a minimum commitment and are more expensive than standard multi-tenant VMs.',
        c: 'CHALLENGE: Disaster Recovery. Sole-tenancy is zonal; you must orchestrate replication to a second sole-tenant node in another zone for HA.'
    },
    {
        cat: 'Compute',
        q: 'Scenario: You are configuring a Custom Machine Type for a specialized memory-resident application. You want to use 3 vCPUs and 2GB of RAM. Is this a valid configuration?',
        a: 'No (Invalid vCPU count and RAM ratio)',
        d: '1. **vCPU Rule**: For custom machines, you must use whole numbers (and typically even numbers like 2 or 4 after 1 vCPU). \n2. **RAM Rule**: You must have at least 0.9 GB of RAM per vCPU. For 3 vCPUs, you would need at least 2.7 GB. \n3. **Shared-Core Exception**: Decimals like 0.2 (micro) or 0.5 (small) only exist in Predefined E2 shared-core instances, not Custom ones.',
        t: 'Heuristic: "Custom" = Whole Even CPUs + Minimum 0.9GB RAM/CPU.',
        l: 'If you need more than 6.5 GB per vCPU, you must enable "Extended Memory," which costs more.',
        c: 'Custom machines are 5% more expensive than predefined machines of the same size.'
    },
    {
        cat: 'Compute',
        q: 'A data scientist needs to run a large-scale in-memory simulation that requires 512GB of RAM but only moderate processing power. Which predefined machine family is the most cost-effective choice?',
        a: 'High-Memory (e.g., n2-highmem-64)',
        d: '1. **Optimization**: High-Memory instances provide the highest RAM-to-vCPU ratio. \n2. **Cost**: By choosing High-Memory, you get the required 512GB of RAM without having to pay for the massive amount of vCPUs that would come with a "Standard" machine of that memory size. \n3. **Use Cases**: In-memory databases, big data analytics, and large caches.',
        t: 'Heuristic: "Lots of RAM, few CPUs" = High-Memory. "Lots of CPUs, little RAM" = High-CPU.',
        l: 'If you need a specific, non-standard ratio, use a "Custom Machine Type" instead of a predefined one.',
        c: 'High-CPU machines often have faster per-core performance (higher clock speeds) than standard machines.'
    },
    {
        cat: 'Compute',
        q: 'Scenario: You are choosing between App Engine Standard and Flexible environments. The application must scale to zero during idle periods to save costs, but it requires a custom non-standard runtime (Go 1.22 with specific C-libraries). Which do you choose and how will you be billed?',
        a: 'App Engine Flexible (Custom Runtime) | Billed by Resource (CPU/RAM/Disk)',
        d: '1. **Standard Environment**: Billed by "Instance Hours." Scales to zero. Supports specific languages (Python, Java, Node, etc.). Best for rapid scaling. \n2. **Flexible Environment**: Billed by specific resource usage (vCPU, RAM, and Persistent Disk). Does NOT scale to zero (minimum 1 instance). Supports Docker containers/Custom runtimes. \n3. **Network**: Both charge for Egress; Ingress is free. \n4. **Shared Services**: Both charge for external services used (Memcache, Search API, Cloud SQL).',
        t: 'Heuristic: "Scale to Zero" = Standard. "Docker/Custom Runtime" = Flexible. "Ingress" = Free.',
        l: 'App Engine Standard has a "Free Tier" (28 instance hours/day), while Flexible does not.',
        c: 'Architect Tip: If you need custom OS-level dependencies, Flexible is the only choice, but it is more expensive because instances stay "on" to handle traffic.'
    },
    {
        cat: 'Compute',
        q: 'Scenario: You need to update the version of your "echo-app" container. You want to ensure that users never see an error page during the transition. Which command do you use, and what strategy does it trigger?',
        a: '`kubectl set image` (triggers a Rolling Update).',
        d: '1. **Mechanism**: Changing the container image in a Deployment manifest automatically starts a Rolling Update. \n2. **Zero Downtime**: The controller spins up new pods and waits for them to be "Ready" before terminating old ones. \n3. **Rollback**: If the new version fails, you can immediately run `kubectl rollout undo deployment/echo-deployment`. \n4. **Service Persistence**: The Service (Load Balancer) remains active and automatically shifts traffic to the new "Ready" pods.',
        t: 'Heuristic: "Update Image" + "Zero Downtime" = set image / rolling update.',
        l: 'If you "delete and recreate" the deployment, you will have 100% downtime during the gap.',
        c: 'Architect Tip: Always use "Readiness Probes." Without them, Kubernetes might think a pod is ready before the app has actually finished booting, causing 500 errors during the update.'
    },

    // --- CATEGORY: STORAGE & DATABASES ---
    {
        cat: 'Storage',
        q: 'Scenario: A global media giant needs a relational database for user subscriptions. It must handle millions of concurrent writes across US, Europe, and Asia with absolute strong consistency to prevent double-billing. What is the solution?',
        a: 'Cloud Spanner (Multi-Region)',
        d: '1. **Origin**: Global user web/mobile traffic. \n2. **Process**: Regional GKE clusters in each continent. \n3. **Persistence**: Cloud Spanner Multi-region instance. \n4. **Sync**: TrueTime (Atomic Clocks) ensures global external consistency without the locking overhead of traditional SQL.',
        t: 'Heuristic: "Global" + "Relational/SQL" + "Strong Consistency" = Cloud Spanner. Cloud SQL is regional only.',
        l: 'LIMITS: High entry cost; Spanner requires a minimum of 3 nodes for multi-region configurations.',
        c: 'CHALLENGE: Schema Design. Using monotonically increasing primary keys (like timestamps) causes Hotspotting. You must use UUIDs or Bit-reversal.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: An IoT company needs to store sensor telemetry from 50 million smart meters. Data arrives every second. They need to perform real-time windowed analytics and sub-10ms single-row lookups for customer dashboards.',
        a: 'Pub/Sub -> Dataflow -> Bigtable',
        d: '1. **Origin**: Smart Meters (mTLS). \n2. **Ingest**: Pub/Sub buffers the stream. \n3. **Process**: Dataflow performs windowed averages (e.g., 5-min usage). \n4. **Persistence**: Cloud Bigtable for high-throughput time-series storage. \n5. **Visualization**: Looker (via BigQuery Federated queries to Bigtable).',
        t: 'Heuristic: "High-Write Throughput" + "NoSQL" + "Time-Series" = Bigtable.',
        l: 'LIMITS: Bigtable is not suitable for data <1TB (cost-inefficient). It does not support SQL JOINs or multi-row transactions.',
        c: 'CHALLENGE: Row-key design. A poor row-key leads to unbalanced nodes (Hotspotting). Keys must be designed for distribution.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: You want to centralize BigQuery query costs. Data is stored in Project-Data-A and Project-Data-B, but all costs must be billed to Project-Billing. Users must not be able to edit the source data. How do you configure IAM?',
        a: 'Billing Project: `roles/bigquery.user` | Data Projects: `roles/bigquery.dataViewer`',
        d: '1. **Billing Project**: Granting `bigquery.user` allows users to run query jobs. The project where the job is created pays the bill. \n2. **Data Projects**: Granting `bigquery.dataViewer` allows users to read tables and metadata. They cannot run jobs here, preventing local project costs. \n3. **Result**: Users select "Project-Billing" in their console. They can query `Project-Data-A.dataset.table`, and the invoice goes to Project-Billing.',
        t: 'Heuristic: "User" role = Who pays. "Viewer" role = Where the data is.',
        l: '`bigquery.jobUser` only allows running jobs; `bigquery.user` also allows creating personal datasets for query results, which is common in analytical projects.',
        c: 'Architect Tip: This pattern is essential for "Data Clean Rooms" or shared data warehouses where a central team provides data to different departments who pay for their own analysis.'
    },
    {
        cat: 'Storage',
        q: 'What are the performance and capacity limits for individual objects in Cloud Storage (GCS)?',
        a: 'Update: 1/sec | Max Object Size: 5TB | Write: 5,000/sec (Initial)',
        d: '1. **Object Updates**: Hard limit of **once per second** for updating/overwriting the *same* object name. \n2. **Max Size**: The maximum size for a single object is **5TB**. \n3. **Initial Throughput**: A new bucket starts at 5,000 writes/sec and 10,000 reads/sec. \n4. **Auto-Scaling**: GCS scales up IOPS as traffic grows, provided you follow the 3-2-1 ramp-up rule.',
        t: 'Heuristic: "One file" = Max 5TB. "Same file name" = Max 1 update/sec.',
        l: 'If a single dataset exceeds 5TB, you must split (shard) it into multiple objects. Exceeding the 1/sec update limit triggers 429 or 503 errors.',
        c: 'Architect Tip: For multi-petabyte datasets, GCS is the standard, but always design your ingestion pipeline to shard large files into smaller chunks (e.g., 100GB - 1TB) for better parallel processing in Dataflow/BigQuery.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: An HPC (High Performance Computing) app needs a shared filesystem accessible by 500 Linux VMs simultaneously with sub-millisecond latency and 100Gbps throughput.',
        a: 'Filestore Enterprise or Parallel Store',
        d: '1. **Mount**: VMs use standard NFSv3/v4 protocol.\n2. **Logic**: Filestore Enterprise provides a managed NAS with multi-zone availability.\n3. **Scale**: Parallel Store (based on DAOS) handles extreme scratch space needs for AI training.',
        t: 'Heuristic: "NFS" + "High-Performance Shared" = Filestore.',
        l: 'Filestore lacks global access; it is a regional resource.',
        c: 'Backup performance; large filesystems take significant time to snapshot.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: You need a database for a social media app that supports "offline sync" for mobile users and "real-time" updates to followers.',
        a: 'Firestore (Native Mode)',
        d: '1. **Client**: Mobile app uses Firestore SDK.\n2. **Sync**: SDK handles local cache and "Real-time Listeners" for push updates.\n3. **Persistence**: NoSQL document store with automatic scaling.',
        t: 'Heuristic: "Mobile Sync" + "Real-time Listeners" = Firestore.',
        l: 'Maximum write rate of 10,000 per second per database (can be increased).',
        c: 'Complex queries; Firestore doesn\'t support traditional SQL JOINS.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: You need to choose storage for a cluster of VMs. Identify the "Network Attached" vs "Local" options and their sharing capabilities.',
        a: 'Persistent Disk & Filestore (Network) vs. Local SSD (Local)',
        d: '1. **Persistent Disk**: Network-attached. Supports Multi-writer (shared RO) or single-writer. Survives VM deletion. \n2. **Filestore**: Network-attached (NFS). Supports multi-reader/multi-writer (RWX). Best for shared configuration/media. \n3. **Local SSD**: Physically attached (NOT network). Lowest latency but ephemeral (data lost on VM stop/delete).',
        t: 'Heuristic: "Shared" = Network (PD/Filestore). "Fastest/Non-persistent" = Local SSD.',
        l: 'Performance of Network storage (PD) scales with the size of the disk and the number of vCPUs.',
        c: 'True/False Tip: Persistent Disks are always network-attached, which is why they can be "Live Migrated" by Google during maintenance.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: Your data is currently in a "Data Lake" (Parquet files in GCS). You want to run SQL queries and build a ML model to predict churn without moving the data into a proprietary format.',
        a: 'BigLake + BigQuery ML (BQML)',
        d: '1. **Storage**: Data stays in GCS. \n2. **Abstraction**: BigLake provides a unified interface to query GCS files as if they were BigQuery tables. \n3. **Intelligence**: Use BigQuery ML to run `CREATE MODEL` directly on the BigLake tables using SQL.',
        t: 'Heuristic: "Query GCS with SQL" = BigQuery External Tables / BigLake.',
        l: 'Queries on GCS files are generally slower than queries on native BigQuery storage (Capacitor).',
        c: 'BigLake allows you to apply row-level and column-level security to files in GCS.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: Dress4Win needs to migrate a high-traffic on-premises Redis cluster used for social graph caching and metadata. The investors want a managed solution that reduces operational overhead and supports sub-millisecond latency.',
        a: 'Cloud Memorystore for Redis',
        d: '1. **Compatibility**: Fully protocol-compatible with Open Source Redis; no code changes required. \n2. **High Availability**: Standard Tier provides cross-zone replication and automatic failover. \n3. **Migration**: Export on-prem data to an .rdb file, upload to GCS, and import into Memorystore.',
        t: 'Heuristic: "Redis replacement" = Memorystore. "Managed Cache" = Memorystore.',
        l: 'Memorystore does not support some Redis commands (like CONFIG) because the underlying infrastructure is managed by Google.',
        c: 'For caching static web content (images/JS), use Cloud CDN; for in-memory application data, use Memorystore.'
    },
    {
        cat: 'Storage',
        q: 'Scenario: What is the peak read/write performance and storage capacity for a single Regional Cloud Spanner node using SSD?',
        a: '22,500 Read QPS / 3,500 Write QPS / 10 TB Storage',
        d: '1. **Read Performance**: 22,500 QPS (up from the legacy 10,000). \n2. **Write Performance**: 3,500 QPS for standard writes; up to 22,500 QPS for throughput-optimized (batched) writes. \n3. **Storage capacity**: Each node now supports 10 TB of data. \n4. **Linear Scaling**: These numbers scale linearly; 2 nodes provide 45,000 Read QPS.',
        t: 'Heuristic: "3.5k Write / 22.5k Read" is the modern 2026 standard.',
        l: 'Multi-region performance is slightly lower (~2,700 Write QPS) due to synchronous replication latency across regions.',
        c: 'If your database hits the 10 TB limit, Spanner requires you to add another node regardless of CPU usage.'
    },

    // --- CATEGORY: NETWORKING ---
    {
        cat: 'Networking',
        q: 'Scenario: You need to deploy an application to App Engine that must access a legacy on-premises database via Cloud VPN. The database must remain private. Which environment is the most "natively" suited for this VPC integration?',
        a: 'App Engine Flexible (Natively runs in your VPC).',
        d: '1. **Flex Network**: Since Flex instances are essentially managed GCE VMs, they reside directly in your VPC. This allows them to route traffic through Cloud VPN to on-prem using internal IPs. \n2. **Standard Network**: Standard runs in a sandboxed Google network. To reach a private VPN, you MUST configure a "Serverless VPC Access connector." \n3. **Security**: Both environments support App Engine Firewall, but Flex gives you more control over the underlying VM network tags.',
        t: 'Heuristic: "App Engine" + "VPN/Direct VPC Access" = Flexible is the "native" path; Standard requires a Connector.',
        l: 'App Engine Flexible has a longer startup time (minutes) and does NOT scale to zero, which increases cost compared to Standard.',
        c: 'Architect Tip: While Standard + Connector is often cheaper, Flex is preferred if your app requires specialized OS-level dependencies or extremely high memory not available in the Standard runtimes.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: Two companies merge. Both use GCP and have identical VPC subnets (10.0.0.0/24). They need to connect their VPCs to share a specific SQL database without re-IPing.',
        a: 'Private Service Connect (PSC)',
        d: '1. **Producer**: The project with the SQL DB creates a PSC Service Attachment.\n2. **Consumer**: The other project creates a PSC Endpoint (an internal IP in their own VPC).\n3. **Logic**: PSC uses NAT to bridge the two VPCs even with overlapping IP ranges.',
        t: 'Heuristic: "Overlapping IPs" + "Connect Services" = Private Service Connect.',
        l: 'PSC is unidirectional (Consumer can talk to Producer, but not vice-versa).',
        c: 'Managing the DNS records in the Consumer VPC to point to the PSC endpoint.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: You are deploying a cluster of C3 instances for a High-Performance Computing (HPC) workload. You need 100 Gbps of egress bandwidth per VM. How do you achieve this, and what is the mandatory configuration?',
        a: 'Use Tier_1 Networking + gVNIC',
        d: '1. **Machine Selection**: Bandwidth scales with vCPU count; choose a large machine type (e.g., c3-standard-88). \n2. **Network Tier**: Explicitly enable "Tier_1" performance on the VM instance. \n3. **Driver**: Install and enable the Google Virtual NIC (gVNIC) driver in the OS image; standard VirtIO drivers cannot hit these speeds.',
        t: 'Heuristic: "High Bandwidth" = High vCPU count + Tier_1 + gVNIC.',
        l: 'Egress bandwidth limits apply to the VM, but actual throughput is also dependent on the target’s capacity and regional congestion.',
        c: 'Tier_1 performance is currently only available on specific machine families like N2, N2D, C3, and C4.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: Your company needs a high-speed, low-latency connection between an on-premises data center and GCP. You require 100 Gbps bandwidth, reduced egress costs, and the ability to access VPC resources without using the public internet. Which Interconnect type do you choose, and what are the key requirements?',
        a: 'Dedicated Interconnect (Direct 10G or 100G circuits)',
        d: '1. **Connectivity**: Direct physical fiber connection at a Google colocation facility. \n2. **Benefits**: Lowest latency, 99.9% or 99.99% SLA (with proper redundancy), and significantly lower egress pricing compared to standard internet. \n3. **Partner Option**: If your data center is NOT in a Google facility, use "Partner Interconnect" via a 3rd party provider (Equinix, Megaport, etc.). \n4. **Routing**: Cloud Router + BGP is mandatory to manage traffic flow.',
        t: 'Heuristic: "Direct Fiber" = Dedicated. "3rd Party Provider" = Partner. "Cost Saving" = Interconnect > VPN.',
        l: 'Interconnect provides the "Pipe," but you still need a VLAN Attachment and Cloud Router to actually move data into your VPC.',
        c: 'Gotchas: 1) Interconnect does NOT encrypt by default (use MACsec or VPN-over-Interconnect if encryption is required). 2) 99.99% SLA requires 4 separate circuits across 2 metropolitan areas.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: Your global website uses query strings (e.g., ?session_id=123) that change for every user but do not change the actual content of the image being served. How do you prevent Cloud CDN from creating a unique cache entry for every single user?',
        a: 'Configure Cache Key "Query String Blacklist" (Exclude Query Strings)',
        d: '1. **Cache Key**: The set of data (URL + Query Strings + Headers) used to identify a cached object. \n2. **Optimization**: By excluding unique query strings like session IDs from the cache key, you increase the "Cache Hit Ratio." \n3. **Result**: All users requesting "image.jpg?session_id=X" will be served the same cached file regardless of the session ID.',
        t: 'Heuristic: "High Cache Hits" = Exclude unique/random query strings.',
        l: 'If the query string *does* change the content (like ?size=large vs ?size=small), you must INCLUDE it in the cache key.',
        c: 'You can also use "Signed URLs" with Cloud CDN to serve cached content securely to authorized users only.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: Your on-premises data center has a 10 Gbps internet link. You need to connect to GCP via Cloud VPN but require at least 4 Gbps of aggregate throughput. A single tunnel only provides ~1.5 Gbps. How do you achieve the target speed?',
        a: 'Create multiple VPN tunnels and enable ECMP (Equal-Cost Multi-Path).',
        d: '1. **Scaling**: Deploy multiple HA VPN tunnels to the same peer gateway. \n2. **Routing**: Use Cloud Router with BGP to advertise the same prefixes over all tunnels with the same **Priority**. \n3. **ECMP Logic**: Google’s network will balance traffic across all active tunnels with equal priority. \n4. **Hash**: Uses a 5-tuple hash to maintain session affinity and prevent packet reordering.',
        t: 'Heuristic: "More than 3Gbps VPN" = Multiple Tunnels + ECMP.',
        l: 'Performance depends on the diversity of your traffic flows. A single "Elephant Flow" (one big file transfer) will still be capped at the speed of a single tunnel.',
        c: 'If you need >10 Gbps consistently, Google recommends moving from VPN to Dedicated Interconnect.'
    },
    {
        cat: 'Networking',
        q: 'Minimal components for a 99.99% SLA HA VPN with automatic route updates (Dynamic Routing)?',
        a: '1 HA VPN Gateway (2 interfaces), 1 Peer Gateway, and 1 Cloud Router.',
        d: '1. **HA VPN Gateway**: One regional resource with TWO public IP interfaces (0 and 1). \n2. **Peer Gateway**: One resource representing the on-premise endpoint(s). \n3. **Cloud Router**: One router is enough to manage BGP for all tunnels in a region. \n4. **Automatic Updates**: This is the "BGP" trigger; without Cloud Router, updates are manual.',
        t: 'Heuristic: "99.99% SLA" = 2 Interfaces/Tunnels. "Automatic Updates" = 1 Cloud Router.',
        l: 'If you see "2 Cloud VPN Gateways" in an old test, they likely mean the two interfaces of an HA Gateway.',
        c: 'Tip: HA VPN ONLY supports Dynamic Routing. You cannot use static routes with HA VPN.'
    },
    {
        cat: 'Networking',
        q: 'Scenario: You want to block ALL outbound traffic from your VMs except for traffic going to an Active Directory server. How do you configure the priorities for your "Allow" and "Deny" egress rules?',
        a: 'Create an "Allow AD" rule with priority 100 and a "Deny All" rule with priority 1000.',
        d: '1. **Evaluation Order**: GCP processes rules from lowest priority number to highest. Evaluation stops at the first match. \n2. **The "Hole Punch"**: By setting the Allow rule to 100 and the Deny rule to 1000, you "punch a hole" through your broad deny policy. \n3. **Implied Rules**: Every VPC has an "Implied Allow Egress" rule at priority 65535. Your custom "Deny All" at 1000 is necessary to override that implied allow. \n4. **Gaps**: It is best practice to use increments of 100 (100, 200, 300) so you can insert rules later without renumbering.',
        t: 'Heuristic: "Small Number = Big Power." Matches are first-come, first-served.',
        l: 'Firewall rules are stateful. If you allow Egress, the corresponding Ingress "response" traffic is automatically allowed regardless of other rules.',
        c: 'Architect Tip: For enterprise environments, use "Hierarchical Firewall Policies" to enforce these "Deny All" rules across every VPC in your entire organization at once.'
    },

    // --- CATEGORY: SECURITY & IDENTITY ---
    {
        cat: 'Security',
        q: 'Scenario: Your GKE application uses a Cloud SQL Auth Proxy sidecar, but users are seeing "Connection Refused" errors. The Cloud SQL instance is healthy. What are the first three things you should check for a Root Cause Analysis?',
        a: '1. IAM Permissions (Cloud SQL Client role) \n2. Outbound Firewall (Ports 443 & 3307) \n3. Instance Connection Name string',
        d: '1. **IAM**: The proxy requires the `Cloud SQL Client` role to authenticate. Use Workload Identity for security. \n2. **Ports**: Port 443 is for the API handshake; Port 3307 is for the actual data tunnel. \n3. **Logs**: Check the proxy container logs (`kubectl logs -c cloud-sql-proxy`). It will tell you if it failed at the Auth, Network, or Instance-Lookup phase.',
        t: 'Heuristic: "Proxy Error" = Check IAM first, then Port 3307.',
        l: 'Cloud SQL Auth Proxy version 2.x is significantly different from 1.x (CLI flags changed). Ensure you are using the modern version.',
        c: 'Architect Tip: In 2026, use the "Cloud SQL Proxy Operator" to automate this sidecar injection and avoid manual YAML errors.'
    },
    {
        cat: 'Security',
        q: 'Scenario: A high-traffic video site needs to block traffic from specific countries and prevent SQL injection attacks at the global edge.',
        a: 'Global External HTTP(S) Load Balancer + Cloud Armor',
        d: '1. **Edge**: Traffic hits Anycast IP at Google Edge.\n2. **Filter**: Cloud Armor Security Policy evaluates the request (Geo-fencing + WAF rules).\n3. **Backend**: Only "Clean" traffic is routed to the GKE/Cloud Run backends.',
        t: 'Heuristic: "Edge Security" + "WAF/DDoS" = Cloud Armor.',
        l: 'Cloud Armor Standard only handles L3/L4; "Enterprise" is needed for L7 ML-based protection.',
        c: 'False Positives; strict SQLi rules might block legitimate API payloads containing special characters.'
    },
    {
        cat: 'Security',
        q: 'If a user is granted the "Editor" role (Allow) at the Project level, but an IAM Deny policy at the Folder level forbids them from deleting disks, can they delete a disk?',
        a: 'No. IAM Deny always overrides IAM Allow.',
        d: '1. **Precedence**: GCP checks Deny policies *before* Allow policies. If a Deny matches, the request is rejected immediately. \n2. **Inheritance**: Both policies are inherited. A Deny at a high level (Org/Folder) cannot be "undone" by an Allow at a lower level (Project). \n3. **Scope**: Allow policies bind Roles to Identities. Deny policies block specific Permissions for Identities. \n4. **Exceptions**: Deny policies can include "Exemptions" for specific users (like a break-glass admin) to bypass the rule.',
        t: 'Heuristic: Deny is a "Brick Wall" that sits in front of the Allow "Open Door."',
        l: 'IAM Deny is a newer feature (v2 API) and does not yet support every single permission in GCP. Always check the supported list.',
        c: '2026 Tip: Use IAM Deny to prevent "Privilege Creep" (e.g., blocking all developers from touching Billing or Security settings, even if they are Project Owners).'
    },
    {
        cat: 'Security',
        q: 'How do IAM policies and Organization Policies interact when they seem to conflict?',
        a: 'They are independent layers. BOTH must allow the action for it to succeed.',
        d: '1. **IAM (Identities)**: Focuses on "Who" (e.g., "Is Bob allowed to create a VM?"). \n2. **Org Policy (Resources)**: Focuses on "Configuration" (e.g., "Are VMs in this project allowed to have Public IPs?"). \n3. **The Logical AND**: If IAM says "Yes" but Org Policy says "No," the action is blocked. \n4. **Hierarchy**: IAM is a UNION (Additive). Org Policy is RESTRICTIVE (Guardrails).',
        t: 'Heuristic: IAM is your "ID Badge." Org Policy is the "Building Code."',
        l: 'Org Policies are used to enforce compliance (e.g., "Data stay in the EU") or prevent expensive mistakes.',
        c: 'Exam Tip: If a question asks how to "prevent all users from ever creating a bucket in us-east1," the answer is an Organization Policy (Location Constraint), not an IAM policy.'
    },

    // --- CATEGORY: MIGRATION ---
    {
        cat: 'Migration',
        q: 'Scenario: A bank needs to migrate a legacy IBM Mainframe application. They require a way to expose Mainframe data as REST APIs to modern cloud apps without a full rewrite immediately.',
        a: 'Connect Enterprise (Legacy Bridge) + Apigee',
        d: '1. **Origin**: Mainframe (z/OS).\n2. **Bridge**: Use a connector (like IBM MQ or specialized Mainframe adapters) to push events to GCP.\n3. **Interface**: Apigee API Management sits in front to provide security, throttling, and a modern REST interface for internal devs.',
        t: 'Heuristic: "Mainframe" + "Modernize API" = Apigee.',
        l: 'High latency due to legacy protocols; not for real-time synchronous trading.',
        c: 'Ensuring EBCDIC to ASCII data conversion is handled correctly in the middleware layer.'
    },
    {
        cat: 'Migration',
        q: 'Scenario: You are migrating 2,000 VMware VMs to GCP. The CEO wants to exit the data center in 6 weeks. There is no time to containerize.',
        a: 'Google Cloud VMware Engine (GCVE)',
        d: '1. **Tool**: GCVE (Managed vSphere/vCenter/NSX-T).\n2. **Migration**: Use HCX to "vMotion" workloads live to Google Cloud.\n3. **Network**: Layer 2 extension allows VMs to keep their original on-prem IP addresses.',
        t: 'Heuristic: "Exit DC fast" + "Keep IPs/VMware" = GCVE.',
        l: 'High cost; you are paying for dedicated physical nodes (3-node minimum).',
        c: 'Storage scaling is tied to compute nodes; you cannot scale storage independently.'
    },
    {
        cat: 'Migration',
        q: 'Scenario: Your organization needs to move 500+ legacy Windows and Linux VMs from an on-premises data center to Google Cloud with minimal downtime. You want to keep existing OS configurations and installed software without manual re-installation.',
        a: 'Migrate to Virtual Machines (M2VM)',
        d: '1. **Assessment**: Use "Migration Center" to discover assets and get AI-powered rightsizing recommendations. \n2. **Replication**: Deploy a "Migrate Connector" on-prem to stream data to GCP in the background (no downtime during sync). \n3. **Validation**: Execute a "Test Clone" to launch the VM in an isolated VPC and verify it works before the actual switch. \n4. **Cut-over**: Shut down the source VM, perform a final sync, and launch the production instance on Compute Engine.',
        t: 'Heuristic: "Move existing VM" + "Minimal downtime" = M2VM. "Start fresh" = Public Image.',
        l: 'M2VM handles "Lift and Shift." If the app requires modernizing (e.g., to Kubernetes), use "Migrate to Containers" instead.',
        c: 'M2VM is free to use (you only pay for the target resources like Compute Engine and Storage).'
    },
    {
        cat: 'Migration',
        q: 'Scenario: You are migrating a SQL Server "Failover Cluster" to GCP. The client requires native "AlwaysOn Availability Group" features. How do you implement this, and what is the DMS mechanism for the move?',
        a: 'Deploy on Compute Engine VMs (for AlwaysOn AG) and use DMS with Log Shipping.',
        d: '1. **Architecture**: To get true "Failover Clustering," use **Compute Engine VMs** to build a Windows Server Failover Cluster (WSFC) with **AlwaysOn Availability Groups**. Cloud SQL is managed and does not expose these cluster settings. \n2. **Migration (DMS)**: For SQL Server to SQL Server, DMS uses **Log Shipping**. It restores a full backup (.bak) from Cloud Storage and then continuously replays transaction logs (.trn) to stay in sync. \n3. **Difference**: Unlike MySQL/Postgres which use CDC (Change Data Capture), SQL Server DMS is "file-based" until promotion. \n4. **HA Choice**: Cloud SQL HA is "Regional Disk" based; VM-based AlwaysOn is "Application" based.',
        t: 'Heuristic: "SQL Server Cluster" = VMs + AlwaysOn. "SQL Server Migration" = DMS + Log Shipping.',
        l: 'Requires the database to be in "Full Recovery" mode. AlwaysOn AG requires SQL Server Enterprise edition for more than two nodes.',
        c: 'Architect Tip: If the client just wants "High Availability" without managing Windows, recommend Cloud SQL (Regional). If they want "Clustering Features," they must go with VMs.'
    },
    {
        cat: 'Migration',
        q: 'You need to migrate 100 TB of data to GCS. You have a 1 Gbps connection. What is the Google-recommended approach and why?',
        a: 'Use the Transfer Appliance.',
        d: '1. **The Week Rule**: If a transfer takes >1 week over the network, use an offline appliance. \n2. **Thresholds**: 100 TB @ 1 Gbps takes ~10-14 days, crossing the threshold. \n3. **Legacy Term**: "Rehydrator" refers to the process of decrypting/expanding the appliance data once it reaches GCS. \n4. **Security**: Data is encrypted on the device with a user-supplied passphrase, making physical shipping safe.',
        t: 'Heuristic: >20TB or >1 Week = Transfer Appliance.',
        l: 'Offline migration is a "point-in-time" copy. You will still need to sync any "delta" changes (new files created during shipping) via the network after the appliance is ingested.',
        c: 'Architect Tip: In 2026, check if "Storage Transfer Service" with multiple agents can saturate your 1 Gbps pipe first. If you can afford the 14-day wait, STS is often cheaper than the shipping/lease fees of an appliance.'
    },
    {
        cat: 'Migration',
        q: 'Scenario: 19.8M "unconnected" vehicles return to depots and upload 500MB CSV files via legacy FTP. The process is insecure, unmonitored, and frequently fails due to network instability. You need a modern, automated end-to-end solution to move this data into a system ready for Gemini-powered predictive maintenance.',
        a: 'Storage Transfer Service (STS) + GCS + Dataflow + BigQuery + Vertex AI',
        d: '1. **Ingestion**: Deploy STS On-Premises Agents to replace manual FTP. They automate retries, handle checksum validation, and only sync new data (delta-sync). \n2. **Storage**: Data lands in a Cloud Storage "Staging" bucket. \n3. **Transformation**: Dataflow automatically triggers to clean CSVs and enrich them with historical repair records from Cloud SQL. \n4. **Analytics & AI**: Cleaned data is loaded into BigQuery. Use "BigQuery Vector Search" or Vertex AI to generate predictive maintenance recommendations based on the ingested telemetry.',
        t: 'Heuristic: "Legacy FTP Replacement" = Storage Transfer Service. "Manual to AI" = GCS -> Dataflow -> BQ.',
        l: 'STS agents are high-performance but require local Docker/Linux environments at the depots; use "Transfer Appliance" if the initial historical backlog is >100TB.',
        c: 'Replacing FTP with STS reduces operational overhead by 80% because it is a managed service that eliminates the need for maintaining custom retry scripts or FTP gateway VMs.'
    },

    // --- CATEGORY: AI & ANALYTICS ---
    {
        cat: 'AI_Services',
        q: 'Architect a 10M-item "Search by Photo" feature. How do you move the image data and link the Vector result back to the inventory database?',
        a: 'GCS (Landing) -> Vertex API (Embedding) -> Vector Search (Match) -> BigQuery/AlloyDB (Grounding).',
        d: '1. **Ingest**: Mobile app uploads photo to **Cloud Storage (GCS)** via a **Signed URL** (for security and bypassing app servers). \n2. **Embed**: A **Cloud Run** backend (triggered by GCS upload) calls the **Vertex Multimodal Embeddings API** (`multimodalembedding@001`) passing the GCS URI to get a 1408-dimension vector. \n3. **Match**: The backend calls the **Vector Search Endpoint** (`findNeighbors`) which returns the **Datapoint ID** (e.g., `SKU-9982`) of the closest match. \n4. **Ground**: The backend uses that ID as a key to query **BigQuery** or **AlloyDB** to fetch the "Human Readable" product details (Price, Stock, Description). \n5. **Sync**: In 2026, use the **BigQuery Import for Vector Search** to keep the vector index updated from the database.',
        t: 'Heuristic: "Vector Search returns the ID; SQL returns the Answer."',
        l: 'Indexing Lag: New items added to BigQuery aren’t searchable in Vector Search until an index rebuild or streaming update occurs (30-60 min latency).',
        c: '2026 Tip: Use "AlloyDB AI" for sub-1M catalogs to keep the vector search *inside* the SQL database for lower latency and less architectural complexity.'
    },
    {
        cat: 'AI_Services',
        q: 'Architect a 100k PDF mortgage processing pipeline with PII redaction. Compare Document AI, Vision, and Gemini for the parsing engine.',
        a: 'Dataflow (Orchestrator) + Document AI (Parser) + Sensitive Data Protection (Redactor).',
        d: '1. **Orchestrator (Dataflow)**: Crucial for scale. It manages parallel API calls to GCS, avoids rate limits, and provides exactly-once processing for 100k files. \n2. **Engines**: \n   - **Document AI (Mortgage Parser)**: Best for complex domain documents. Understands field relationships (e.g., "Interest Rate" vs "Loan Term"). \n   - **Document AI (Form Parser)**: Best for standard, non-industry forms (tables, key-value pairs). \n   - **Cloud Vision API**: Best for pure OCR (turning pixels to text) without needing field understanding. \n   - **Gemini 1.5 Flash (Vertex AI)**: Best for unstructured, messy docs (handwritten notes, letters) or when speed/cost are priority. \n3. **Redaction**: Dataflow sends text to **Sensitive Data Protection (DLP)** to mask SSNs before BigQuery ingestion. \n4. **Audit**: Use **HITL (Human-in-the-Loop)** tasks for files where AI "Confidence Score" falls below a threshold (e.g., < 0.8).',
        t: 'Heuristic: "Domain Forms" = Doc AI. "Messy/Unstructured" = Gemini. "High Scale" = Dataflow.',
        l: 'Sync vs Async: 100k docs requires "Async Batch" methods in Document AI to prevent time-outs.',
        c: '2026 Tip: Use "Gemini 1.5 Flash" in your Dataflow pipeline to summarize long mortgage documents while Document AI extracts the specific numbers.'
    },
    {
        cat: 'AI_Services',
        q: 'How do you build a support bot that answers from 1,000s of PDF manuals without retraining? Compare the "Managed" vs "Custom" approach.',
        a: 'Managed: Vertex AI Search (RAG-in-a-box). Custom: GCS -> Vertex AI RAG Engine -> Vector Search.',
        d: '1. **Managed (Best Practice)**: Use **Vertex AI Search**. It automates the "unseen" heavy lifting: OCR, document chunking, embedding generation, and metadata indexing. \n2. **Custom (Control)**: Use **Vertex AI RAG Engine**. You provide the documents in GCS, and it orchestrates the retrieval but allows you to swap out the Vector Database (e.g., Pinecone, Weaviate, or Vertex Vector Search). \n3. **Grounding**: Both methods use **Gemini 1.5 Pro/Flash** to generate answers. The "Magic" is the **Grounding Metadata** which provides citations (Page #, Manual Name) so technicians can verify the bot’s advice.',
        t: 'Heuristic: "Talk to Docs" = Vertex AI Search. "Custom Chunking/Control" = RAG Engine.',
        l: 'Vertex AI Search is "Turnkey" but offers less control over how text is split (chunked). Large 4K PDFs with complex diagrams may still require **Document AI Layout Parser** first.',
        c: '2026 Tip: Use the "Check Grounding" API to verify the bot\'s answer against the manual and give it a "Trust Score" before showing it to the technician.'
    },

    // --- CATEGORY: GOVERNANCE & OPERATIONS ---
    {
        cat: 'Governance',
        q: 'Scenario: A healthcare provider needs to store patient records for 7 years. The data must be immutable (cannot be deleted or modified) to comply with HIPAA and SEC rules.',
        a: 'Cloud Storage + Bucket Lock (Retention Policy)',
        d: '1. **Store**: Cloud Storage (Standard or Archive).\n2. **Policy**: Apply a Retention Policy (e.g., 2,555 days).\n3. **Enforce**: "Lock" the bucket. Once locked, even the Project Owner cannot delete objects until the timer expires.',
        t: 'Heuristic: "Immutable" + "Regulatory" = Bucket Lock.',
        l: 'Once a bucket is locked, the policy cannot be shortened or removed. Permanent commitment.',
        c: 'Testing: If you lock a bucket with 1PB of data by mistake, you are paying for that storage for the duration of the lock.'
    },
    {
        cat: 'Governance',
        q: 'Scenario: You need to ensure that no "shadow IT" developers are creating Public IP addresses on VMs or GKE nodes.',
        a: 'Organization Policy (Restrict Public IP)',
        d: '1. **Constraint**: `compute.vmExternalIpAccess`.\n2. **Scope**: Apply at the Organization or Folder level.\n3. **Result**: Any attempt to create a VM with an external IP is blocked at the API level.',
        t: 'Heuristic: "Enforce No Public IP" = Org Policy.',
        l: 'Cannot be overridden by project-level IAM owners.',
        c: 'Exception handling; some services (like NAT Gateways or Load Balancers) legitimately need public IPs.'
    },
    {
        cat: 'DevOps',
        q: `What is the current <b>Google-Native</b> recommended toolset for a secure, gated CI/CD pipeline targeting GKE?`,
        a: `Cloud Build (CI) + Artifact Registry (Storage) + Cloud Deploy (CD).`,
        d: `1. <b>Cloud Build</b>: Triggers on Git commits. It compiles code, builds Docker images, and runs unit tests.
            2. <b>Artifact Registry</b>: Stores images and automatically scans them for <b>vulnerabilities</b>. It replaces the legacy Container Registry.
            3. <b>Cloud Deploy</b>: Manages the <b>Release</b> object and handles <b>promotions</b> between environments (e.g., Staging to Production) with a built-in approval UI.
            4. <b>Binary Authorization</b>: The "Gatekeeper." It ensures GKE only runs images signed by Cloud Build, blocking any untrusted or manual deployments.
            5. <b>Rollbacks</b>: Cloud Deploy allows a <b>one-click rollback</b> to the previous "known good" release state across the entire cluster.`,
        t: `Heuristic: "Build" = Cloud Build. "Deploy/Gate" = Cloud Deploy + BinAuth.`,
        l: `Cloud Deploy is optimized for GKE and Cloud Run. For complex multi-cloud legacy migrations, you may still require <b>Anthos</b> or <b>Jenkins</b>.`,
        c: `Architect Tip: In 2026, the gold standard is <b>Shift Left Security</b>—using Cloud Build to perform <b>Attestations</b> (cryptographic signatures) that Binary Authorization verifies at the cluster edge.`
    },
    // --- CATEGORY: Altostrat Case Study ---
    {
    cat: 'Altostrat',
    q: 'Scenario: Altostrat needs to bridge on-prem media ingestion with cloud delivery. Requirements: "Maintain a hybrid footprint for on-prem media ingestion" [TR-1], "Provide performant GKE environments both on-premises and in the cloud" [TR-2], and allow on-prem pods to securely access GCP APIs without using static JSON keys.',
    a: 'GKE Enterprise (Anthos) + Dedicated Interconnect + Workload Identity Federation.',
    d: '1. **Connectivity**: 10/100 Gbps Dedicated Interconnect with Cloud Router (BGP) for SLA-backed throughput [TR-1].\n2. **Orchestration**: GKE Enterprise (Anthos) provides a unified control plane for on-prem and GKE Autopilot cloud clusters [TR-2].\n3. **Identity**: Workload Identity Federation allows on-prem GKE pods to assume IAM roles via a Security Token Service (STS) to call GCP APIs securely.',
    t: 'Heuristic: "Hybrid GKE" + "SLA-backed ingest" = GKE Enterprise + Dedicated Interconnect.',
    l: 'Dedicated Interconnect requires physical cross-connects at a Google colocation facility (6-8 week lead time).',
    c: 'Shared VPC should be used to provide centralized control of these hybrid network resources across multiple projects.',
},
{
    cat: 'Altostrat',
    q: 'Scenario: The library is growing rapidly and manual tagging is a bottleneck. Requirements: "Auto-generate summaries and extract metadata from media" [BR-2], ensure "AI systems must be auditable and decisions can be explained" [TR-3], and minimize API overhead for multimodal (video/image) analysis.',
    a: 'BigQuery ML (BQML) with Gemini 1.5 Pro Remote Models.',
    d: '1. **Trigger**: GCS Object Finalize triggers a Cloud Run function.\n2. **Intelligence**: BQML calls Gemini 1.5 Pro via a Remote Model (connection). Gemini analyzes video directly for both tags and summaries in one call [BR-2].\n3. **Audit**: Use Vertex AI Explainable AI for feature attribution and Cloud Logging for prompt/response audits [TR-3].',
    t: 'Heuristic: "SQL-based AI" + "Multimodal Metadata" = BQML + Gemini.',
    l: 'BQML Remote Models have concurrency limits; large batch jobs may require monitoring "job_status" for quota throttling.',
    c: 'Gemini 1.5 Pro replaces the need for separate Vision, Video Intelligence, and Natural Language API calls.',
},
{
    cat: 'Altostrat',
    q: 'Scenario: Altostrat wants to increase engagement via a 24/7 support chatbot [BR-1]. Requirements: "Enable 24/7 user support via natural language interactions," prevent prompt injection/harmful content [TR-3], and ensure only valid subscribers can access the interface.',
    a: 'Vertex AI Search and Conversation + Model Armor + Identity-Aware Proxy (IAP).',
    d: '1. **Chatbot**: Vertex AI Agent grounded in the BigQuery metadata library for factual accuracy [BR-1].\n2. **Security**: Model Armor acts as a firewall for LLM prompts to filter PII and injection attacks [TR-3].\n3. **Access**: IAP validates user identity (IAM) at the HTTP layer before traffic reaches the GKE-hosted frontend.',
    t: 'Heuristic: "Grounded Chatbot" + "AI Firewall" = Vertex AI Conversation + Model Armor.',
    l: 'Vertex AI Search "Grounding" is only as fresh as the last BigQuery sync or data ingestion index.',
    c: 'IAP eliminates the need for a VPN for internal/subscriber-only web access.',
},
{
    cat: 'Altostrat',
    q: 'Scenario: Storage volumes are scaling to Petabytes. Requirements: "Optimize cloud storage costs for growing media volumes" [CC-1], move from on-prem CapEx to OpEx, and ensure compute costs are only incurred during active processing.',
    a: 'Cloud Storage Autoclass + GKE Autopilot.',
    d: '1. **Storage**: Autoclass automatically transitions objects between Standard, Nearline, Coldline, and Archive based on access [CC-1].\n2. **Compute**: GKE Autopilot ensures you pay for Pod resource requests rather than idle underlying Node capacity.\n3. **Lifecycle**: Use specific Lifecycle Rules to delete non-critical temporary transcoding artifacts after 24 hours.',
    t: 'Heuristic: "PB-scale cost optimization" = GCS Autoclass + GKE Autopilot.',
    l: 'Autoclass does not support objects smaller than 128KB for automatic transitions to colder tiers.',
    c: 'Retrieval costs (egress/access fees) for Archive class can be significant if the data is suddenly needed.',
},
    // --- CATEGORY: FINAL (The 10-Minute Pre-Test Sprint) ---
    {
        cat: 'Final',
        q: 'GCS: What is the hard limit on updating the same object name?',
        a: '1 update per second.',
        d: 'If your app needs to update a single "state.json" file 100 times a second, GCS is the WRONG choice. Use Firestore or Redis instead.',
        t: 'Heuristic: "1/sec = GCS limit."'
    },
    {
        cat: 'Final',
        q: 'GCS: What is the maximum size of a single object?',
        a: '5 TB.',
        d: 'For 100TB datasets, you must shard into at least 20 files.',
        t: 'Heuristic: "5TB = Max File Size."'
    },
    {
        cat: 'Final',
        q: 'Spanner: What is the minimum storage requirement trigger for adding nodes?',
        a: '10 TB per node.',
        d: 'Even if CPU is at 1%, if you have 11TB of data, you MUST pay for 2 nodes.',
        t: 'Heuristic: "10TB = 1 Spanner Node."'
    },
    {
        cat: 'Final',
        q: 'Cloud Run: What is the maximum request timeout?',
        a: '60 minutes (3600 seconds).',
        d: 'If a job takes 2 hours, do not use Cloud Run (Web). Use Cloud Run Jobs or Dataflow.',
        t: 'Heuristic: "1 Hour = Cloud Run Limit."'
    },
    {
        cat: 'Final',
        q: 'Filestore: Can it be accessed from outside its region?',
        a: 'No.',
        d: 'Filestore is a Regional resource. To share data across regions, you must sync GCS buckets or use a 3rd party tool.',
        t: 'Heuristic: "Filestore = Regional Only."'
    },
    {
        cat: 'Final',
        q: 'Trigger: When do you choose Spanner over Cloud SQL?',
        a: '1. Global Footprint. 2. Strong Consistency across regions. 3. Data > 64TB.',
        t: 'Heuristic: "Global/Massive = Spanner."'
    },
    {
        cat: 'Final',
        q: 'Trigger: When do you choose Bigtable over BigQuery?',
        a: 'When you need <10ms latency for single-row lookups (Serving).',
        d: 'BigQuery is for "People asking questions" (Analytics). Bigtable is for "Apps serving users" (Production).',
        t: 'Heuristic: "Millisecond lookup = Bigtable."'
    },
    {
        cat: 'Final',
        q: 'Trigger: What is the "Silver Bullet" for connecting two VPCs with overlapping IP addresses (e.g., 10.0.0.0/24), and why does it work?',
        a: 'Private Service Connect (PSC).',
        d: '1. **The Problem**: VPC Peering fails if IP ranges overlap because the routing table becomes ambiguous. \n2. **The Fix**: PSC does not "peer" networks; it exposes a specific service behind a **Service Attachment** (Producer) and a **PSC Endpoint** (Consumer). \n3. **NAT Magic**: Traffic is translated (NAT) at the Google software-defined network layer (Andromeda). The Consumer only sees a local, unique IP from their own subnet, effectively "hiding" the overlapping range of the Producer. \n4. **Direction**: PSC is strictly **unidirectional** (Consumer-to-Producer).',
        t: 'Heuristic: "Overlapping IPs = PSC." (VPC Peering = No Overlap allowed).',
        l: 'Requires an Internal Load Balancer (ILB) on the Producer side to sit behind the Service Attachment.',
        c: '2026 Architect Tip: PSC is now the "Managed Default." Google is moving away from Private Service Access (PSA) and Peering in favor of PSC because it eliminates IP exhaustion and overlap headaches.'
    },
    {
        cat: 'Final',
        q: 'Trigger: How do you get 99.99% SLA for connectivity?',
        a: 'Dedicated Interconnect + 2 Metros + 4 Circuits.',
        t: 'Heuristic: "4-Nines = 4-Pipes in 2-Cities."'
    },
    {
        cat: 'Final',
        q: 'Trigger: What is the difference between Shielded VM and Confidential VM?',
        a: 'Shielded = Boot Integrity (Anti-Rootkit). Confidential = Memory Encryption (In-Use).',
        t: 'Heuristic: "Confidential = RAM Encryption."'
    },
    {
        cat: 'Final',
        q: 'GCS: What are the minimum storage durations for cold classes?',
        a: 'Nearline: 30 days | Coldline: 90 days | Archive: 365 days.',
        d: 'Early deletion before these minimums triggers a "pro-rated" storage charge for the remaining time.',
        t: 'Heuristic: "30 / 90 / 365 days."'
    },
    {
        cat: 'Final',
        q: 'Networking: What is the rule for expanding a VPC subnet CIDR range?',
        a: 'You can only INCREASE the size; you can never decrease it.',
        d: 'To shrink a subnet (e.g., /20 to /24), you must delete the subnet and recreate it.',
        t: 'Heuristic: "Expand only; No Shrinking."'
    },
    {
        cat: 'Final',
        q: 'GCS Consistency: Which operations are Strong vs. Eventual?',
        a: 'Object Ops = Strong | List Ops = Eventual.',
        d: 'Strong: read-after-write/update/delete. Eventual: listing objects in a bucket immediately after a write.',
        t: 'Heuristic: "Data is Strong; Meta is Eventual."'
    },
    {
        cat: 'Final',
        q: 'GKE: Zonal vs. Regional cluster Control Plane (Master) HA?',
        a: 'Zonal = 1 Master. Regional = 3 Masters (in 3 different zones).',
        d: 'Always choose Regional clusters for production workloads to ensure the Kubernetes API remains available during a zonal outage.',
        t: 'Heuristic: "Regional GKE = HA Control Plane."'
    },
];