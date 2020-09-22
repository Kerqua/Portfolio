<?php
	
	//include "php/connect.php";
	if(basename($_SERVER["SCRIPT_FILENAME"], '.php') != "index" && basename($_SERVER["SCRIPT_FILENAME"], '.php') != "logout"){
		include "php/header.php";
	}


	//permissions
	$RolePermission = array(
		//Agenda
		"PaginaAgenda"=>array(1,2,3),
		"WerkzaamheidRegistreren"=>array(1,3),
		"WerkzaamheidVerwijderen"=>array(1,3),
		"WerkzaamheidWijzigen"=>array(3),
		
		//Gebruikers
		"PaginaGebruikers"=>array(3),
		"GebruikerRegistreren"=>array(3),
		"GebruikerVerwijderen"=>array(3),
		"GebruikerWijzigen"=>array(3),
		"WachtwoordGebruikerWijzigen"=>array(),
		"MaakGebruikerAdmin"=>array(),
		
		//Klanten
		"PaginaKlanten"=>array(2,3),
		"KlantRegistreren"=>array(2,3),
		"KlantVerwijderen"=>array(2,3),
		"KlantWijzigen"=>array(2,3),
	);
	
	function RequestPermission($request_par,$role_par){
		global $conn;
		global $RolePermission;
		$id = $_SESSION["User"]['id'];
		$sql_permissions = "SELECT COUNT(*) FROM bevoegdheden WHERE GebruikerId='$id' AND Bevoegdheid='$request_par'";
		$result = $conn->prepare($sql_permissions);
		$result->execute();
		
		if($result->fetchColumn() == "1" OR in_array($role_par, $RolePermission[$request_par])){
			return true;
		}else{
			return false;
		}
	}
		
	function PageMainGoTo(){
		switch($_SESSION["User"]->role){
			case "1":
				header("Location: ./index.php?agenda.inc.php");
				break;
			case "2":
				header("Location: ./index.php?klanten.inc.php");
				break;
			case "3":
				header("Location: ./index.php?gebruikers.inc.php");
				break;
			default:
				
				break;
		}
	}



	function Login( $naam_par, $rol_par, $id_par){
		
		//$_SESSION["User"] = new User($naam_par, $rol_par, $id_par);
		$_SESSION["User"] = array(
			"naam"=>$naam_par,
			"rol"=>$rol_par,
			"id"=>$id_par
		);
	}
	
	function Logout(){
		session_destroy();
	}
?>
