export const services = [
  { slug: 'web-development', title: 'Web Development', description: 'Responsive websites and web applications designed around your business workflows.', sections: [
    ['Websites built around your visitors', 'Plan the pages, navigation and forms around what visitors need to understand and do. A clear content structure helps customers find services, compare products and contact your team.'],
    ['From interface to integration', 'Bring responsive interfaces together with backend APIs, content and business systems. Discuss existing tools, accessibility needs and expected traffic before defining the scope.'],
    ['Plan your project', 'Share your existing website, target audience, essential pages and required integrations. We can discuss a suitable approach and the next steps.'] ] },
  { slug: 'mobile-app-development', title: 'Mobile App Development', description: 'Cross-platform mobile applications for customer experiences and business operations.', sections: [
    ['Design for everyday tasks', 'Start with the actions people need to complete on a phone, such as checking information, submitting requests or updating work. Keep the essential journey clear on smaller screens.'],
    ['Connect your application', 'Define how the app connects to accounts, APIs and existing business data. Authentication, permissions and unreliable network conditions should be considered during planning.'],
    ['Discuss your requirements', 'Tell us your target platforms, user roles, core workflows and integration needs so the project scope reflects your business.'] ] },
  { slug: 'cloud-solutions', title: 'Cloud Solutions', description: 'Cloud infrastructure planning and implementation for growing business applications.', sections: [
    ['Infrastructure that fits the workload', 'Choose an approach around application requirements, traffic, data storage and operational responsibilities. Capacity and cost expectations belong in the initial discussion.'],
    ['Prepare for operations', 'Plan environments, deployment processes, monitoring and backup requirements alongside application development. Identify who will respond when a service needs attention.'],
    ['Start with your current setup', 'Share the services you run, expected usage and operational challenges. We can discuss migration or infrastructure improvements against those requirements.'] ] },
  { slug: 'backend-engineering', title: 'Backend Engineering', description: 'APIs and database systems that connect interfaces with reliable business workflows.', sections: [
    ['Model the business workflow', 'Identify the records, relationships and state changes that the application needs. Clear data models help teams agree on how information moves through the system.'],
    ['Connect systems through APIs', 'Define API contracts, authentication and role permissions around each integration. Validation and error handling are part of the interface between services.'],
    ['Discuss your backend', 'Bring your existing API documentation, data sources and integration requirements. We can help scope new backend services or improvements to an existing application.'] ] },
  { slug: 'ai-solutions', title: 'AI Solutions and Marketing Agents', description: 'AI-assisted workflows for campaigns, content and lead engagement.', sections: [
    ['Choose a focused workflow', 'Start with a specific task where AI assistance could reduce repetitive work. Campaign preparation, content drafts and lead engagement are examples to evaluate against your current process.'],
    ['Keep people in control', 'Agree on approved data sources, review steps and when a person must take over. Define what a useful output looks like before connecting automation to customer-facing workflows.'],
    ['Explore a suitable scope', 'Describe the task, available data, current tools and desired level of human review. These details help determine whether an AI workflow is appropriate.'] ] },
  { slug: 'custom-software-development', title: 'Custom Software Development', description: 'Tailored business applications that connect your teams, data and operational processes.', sections: [
    ['Start with the business problem', 'Map the tasks your team performs, the information it needs and the limitations of existing tools. This creates a practical basis for deciding what to build first.'],
    ['Connect the right components', 'A custom solution can bring together web interfaces, backend APIs, reporting and integrations. The right scope depends on your users and the systems already in place.'],
    ['Define a reviewable first release', 'Prioritize the essential workflows and agree on how they will be reviewed. Share your requirements with YarrowTech to discuss the approach, dependencies and next steps.'] ] },
  { slug: 'erp-development', title: 'ERP Development', description: 'Connected ERP workflows for education, retail, food and beverage, and sports operations.', sections: [
    ['Bring operations together', 'ERP planning starts with the people, records and approvals involved in everyday work. Identify where separate spreadsheets or applications cause duplicate effort or inconsistent reporting.'],
    ['Explore an industry platform', 'YarrowTech has product platforms for education, retail, food and beverage, and sports management. Review the relevant product to see how its listed capabilities match your requirements.'],
    ['Plan permissions and rollout', 'Define user roles, migration requirements, reports and integration dependencies before implementation. A demo can help clarify the fit and any additional requirements.'] ] },
];

export const industries = [
  { slug: 'education', title: 'Education Management Software', productSlug: 'electronic-educare' },
  { slug: 'retail', title: 'Retail Management Software', productSlug: 'retail-management-system' },
  { slug: 'food-and-beverage', title: 'Food and Beverage Management Software', productSlug: 'food-and-beverage-management-system' },
  { slug: 'sports', title: 'Sports Management Software', productSlug: 'esportm' },
];

export const articles = [
  { slug: 'planning-an-erp-project', title: 'How to prepare your team for an ERP project', description: 'A practical checklist for documenting workflows, user roles, data and integrations before an ERP discussion.', sections: [
    ['Map the work before choosing features', 'List the recurring tasks your team performs and who owns each one. Record where information is first entered, where approvals happen and which reports people use. This helps separate essential workflows from features that can wait.'],
    ['Review data and permissions', 'Identify the spreadsheets and applications that contain the records you need. Check for duplicate entries and missing fields. Write down which roles should be able to view, create or approve each type of record.'],
    ['Prepare a realistic demo scenario', 'Use a representative workflow and sample data without confidential information. Ask the team to follow the process from start to finish, including exceptions. Record gaps and integration questions for the next discussion.'],
    ['Agree on success before rollout', 'Decide what a successful first release must support and who will verify it. Include training, migration and support responsibilities in the plan. Review YarrowTech’s ERP services and industry products to prepare your requirements.'] ], serviceSlug: 'erp-development' },
  { slug: 'choosing-business-software', title: 'Choosing between an existing platform and custom software', description: 'Questions to help compare an industry platform with a custom business application.', sections: [
    ['Start with the essential workflow', 'Write down what your business needs to do before comparing feature lists. Distinguish requirements from preferences and consider the people who will use the software each day.'],
    ['Compare fit and integration needs', 'An industry platform is worth exploring when its workflows match your operations. Custom software is worth discussing when important processes or integrations need a different approach. Test those assumptions with a concrete demonstration.'],
    ['Consider ongoing responsibilities', 'Ask how data will be imported and exported, how users and permissions are managed, and how changes are requested. Include maintenance, support and training in your evaluation.'],
    ['Make the next conversation specific', 'Share your user roles, current tools, critical workflows and constraints. A focused brief makes it easier to discuss whether an existing YarrowTech product or a custom application is a suitable starting point.'] ], serviceSlug: 'custom-software-development' },
];
