<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE);
    if($_GET['action'] == "append")
    {
        if(!preg_match('/[.#\\-$><?!()&%]/', $_GET['name']) && is_numeric($_GET['score']) && !preg_match('/[.\\-$><?!()&%]/', $_GET['hash']) )
        {
            Append($_GET['name'],$_GET['score'],$_GET['hash']);
        }
    }

    $query = Get(20);
    $output = "[";
    while ($row = mysql_fetch_array($query))
    {
        $output = $output."['".$row[0]."','".$row[1]."',".$row[2]."],";
    }
    $output = substr($output, 0, -1);
    $output = $output."]";
    echo $output;

    function Append($name,$score,$hash)
    {
        $praefix = "gg_";
        $statement = "INSERT INTO `".$praefix."highscore`(`name`,`hash`,`date`,`score`) VALUES('".$name."','".$hash."', '".date("Y-m-d H:i:s")."', ".$score.")";
        MysqlExec($statement);
    }

    function Get($amount)
    {
        $praefix = "gg_";
        $statement = "SELECT `name`, `date`, `score` FROM `".$praefix."highscore` ORDER BY `score` DESC LIMIT ".$amount;
        return MysqlExec($statement);
    }

    function MysqlExec($statement)
    {
        include("config.php");
        $praefix = "gg_";
        //DBConnect
        $dblink = mysql_connect($gHOST, $gUSER, $gPASS) or die(": " . mysql_error());
        mysql_select_db($gDB,$dblink);
        return mysql_query($statement,$dblink);
    }
?>
