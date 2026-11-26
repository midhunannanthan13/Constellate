try:
    import pymysql
    # Enable PyMySQL to act as the native MySQLdb client for Django
    pymysql.install_as_MySQLdb()
except ImportError:
    # If pymysql is not installed, fallback to native MySQLdb/mysqlclient
    pass
