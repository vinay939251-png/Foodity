import pymysql

# This line tricks Django into thinking pymysql is a newer version
pymysql.version_info = (2, 2, 4, "final", 0) 

pymysql.install_as_MySQLdb()