// OpenAPI 3.0 Specification for CariKerja API
// This is a static spec object that can be used both server-side and client-side

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CariKerja API Documentation',
    version: '1.0.0',
    description: 'API documentation for CariKerja - Job Portal Platform by Disnaker Kabupaten Cirebon',
    contact: {
      name: 'Disnaker Kabupaten Cirebon',
      url: 'https://kerjasimpel.vercel.app/'
    },
    license: {
      name: 'Private',
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development'
    },
    {
      url: 'https://kerjasimpel.vercel.app/',
      description: 'Production Server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Jobs', description: 'Job listing endpoints' },
    { name: 'Applications', description: 'Job application endpoints' },
    { name: 'Profile', description: 'User profile endpoints' },
    { name: 'Companies', description: 'Company endpoints' },
    { name: 'Admin', description: 'Admin panel endpoints' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from /api/auth/login'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token stored in httpOnly cookie'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' },
          success: { type: 'boolean', example: false }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'SecurePass123!' },
          role: { type: 'string', enum: ['jobseeker', 'recruiter'], description: 'Optional role validation' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login berhasil' },
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT token' },
          csrfToken: { type: 'string', description: 'CSRF token for protected requests' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['JOBSEEKER', 'RECRUITER', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
          name: { type: 'string' }
        }
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          slug: { type: 'string' },
          title: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string' },
          type: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] },
          salary: { type: 'string' },
          category: { type: 'string' },
          postedDate: { type: 'string', format: 'date-time' },
          applicants: { type: 'integer' },
          description: { type: 'string' },
          requirements: { type: 'array', items: { type: 'string' } },
          skills: { type: 'array', items: { type: 'string' } }
        }
      },
      JobsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/Job' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalCount: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNextPage: { type: 'boolean' },
              hasPrevPage: { type: 'boolean' }
            }
          }
        }
      },
      Application: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          jobId: { type: 'integer' },
          jobseekerId: { type: 'string' },
          status: { 
            type: 'string', 
            enum: ['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] 
          },
          coverLetter: { type: 'string' },
          appliedAt: { type: 'string', format: 'date-time' }
        }
      },
      Company: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          logo: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string' },
          city: { type: 'string' },
          province: { type: 'string' },
          verified: { type: 'boolean' }
        }
      }
    }
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User login',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Successful login',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          429: {
            description: 'Too many requests - rate limited'
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'User logout',
        description: 'Clear authentication cookies',
        responses: {
          200: { description: 'Logout successful' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Get authenticated user information',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/auth/register/jobseeker': {
      post: {
        tags: ['Auth'],
        summary: 'Register jobseeker',
        description: 'Create a new jobseeker account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'phone'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                  phone: { type: 'string', example: '08123456789' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error or email already exists' }
        }
      }
    },
    '/api/auth/register/recruiter': {
      post: {
        tags: ['Auth'],
        summary: 'Register recruiter',
        description: 'Create a new recruiter account with company',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password', 'phone', 'companyName'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  phone: { type: 'string' },
                  companyName: { type: 'string' },
                  companyIndustry: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful (pending verification)' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List jobs',
        description: 'Get paginated list of active job listings with filters',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in title, description, company' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by city/province' },
          { name: 'jobType', in: 'query', schema: { type: 'string' }, description: 'Filter by job type (comma-separated): FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category (comma-separated)' },
          { name: 'experience', in: 'query', schema: { type: 'string' }, description: 'Filter by experience level: 0-1 tahun, 1-3 tahun, 3-5 tahun, 5+ tahun' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['latest', 'salary', 'popular'], default: 'latest' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
        ],
        responses: {
          200: {
            description: 'List of jobs',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobsListResponse' }
              }
            }
          },
          429: { description: 'Rate limited' }
        }
      }
    },
    '/api/jobs/{slug}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job details',
        description: 'Get detailed information about a specific job',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'Job slug or ID' }
        ],
        responses: {
          200: {
            description: 'Job details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Job' }
                  }
                }
              }
            }
          },
          404: { description: 'Job not found' }
        }
      }
    },
    '/api/jobs/{slug}/apply': {
      post: {
        tags: ['Applications'],
        summary: 'Apply to job',
        description: 'Submit job application (Jobseeker only, requires authentication)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'X-CSRF-Token', in: 'header', required: true, schema: { type: 'string' }, description: 'CSRF token from login response' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  coverLetter: { type: 'string', description: 'Cover letter text' },
                  expectedSalary: { type: 'integer', description: 'Expected salary in IDR' },
                  availableDate: { type: 'string', format: 'date' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Application submitted successfully' },
          400: { description: 'Already applied or job closed' },
          401: { description: 'Unauthorized - login required' },
          403: { description: 'Not a jobseeker' }
        }
      }
    },
    '/api/applications/{id}/withdraw': {
      patch: {
        tags: ['Applications'],
        summary: 'Withdraw application',
        description: 'Withdraw a pending or reviewing application',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'X-CSRF-Token', in: 'header', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Application withdrawn' },
          400: { description: 'Cannot withdraw - application already processed' },
          401: { description: 'Unauthorized' },
          404: { description: 'Application not found' }
        }
      }
    },
    '/api/companies': {
      get: {
        tags: ['Companies'],
        summary: 'List companies',
        description: 'Get list of verified companies',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'industry', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
        ],
        responses: {
          200: { description: 'List of verified companies' }
        }
      }
    },
    '/api/companies/{slug}': {
      get: {
        tags: ['Companies'],
        summary: 'Get company details',
        description: 'Get detailed information about a company including jobs',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Company details with active jobs' },
          404: { description: 'Company not found' }
        }
      }
    },
    '/api/profile/jobseeker': {
      get: {
        tags: ['Profile'],
        summary: 'Get jobseeker profile',
        description: 'Get complete jobseeker profile with education, experience, and skills',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Jobseeker profile' },
          401: { description: 'Unauthorized' },
          404: { description: 'Profile not found' }
        }
      },
      post: {
        tags: ['Profile'],
        summary: 'Update jobseeker profile',
        description: 'Update jobseeker profile information',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'X-CSRF-Token', in: 'header', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  gender: { type: 'string' },
                  address: { type: 'string' },
                  city: { type: 'string' },
                  province: { type: 'string' },
                  summary: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                  experiences: { type: 'array', items: { type: 'object' } },
                  educations: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/profile/recruiter/dashboard': {
      get: {
        tags: ['Profile'],
        summary: 'Get recruiter dashboard',
        description: 'Get recruiter statistics and summary data',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Dashboard data with job and application statistics' },
          401: { description: 'Unauthorized' },
          403: { description: 'Not a recruiter' }
        }
      }
    },
    '/api/homepage/stats': {
      get: {
        tags: ['Homepage'],
        summary: 'Get homepage statistics',
        description: 'Get platform statistics for homepage display',
        responses: {
          200: {
            description: 'Platform statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalJobs: { type: 'integer' },
                    totalCompanies: { type: 'integer' },
                    totalJobseekers: { type: 'integer' },
                    totalApplications: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/homepage/featured-jobs': {
      get: {
        tags: ['Homepage'],
        summary: 'Get featured jobs',
        description: 'Get list of featured/premium job listings',
        responses: {
          200: { description: 'List of featured jobs' }
        }
      }
    },
    '/api/homepage/top-companies': {
      get: {
        tags: ['Homepage'],
        summary: 'Get top companies',
        description: 'Get list of top verified companies',
        responses: {
          200: { description: 'List of top companies' }
        }
      }
    }
  }
}

export default swaggerSpec
